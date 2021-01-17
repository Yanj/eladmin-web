<template>
  <span>
    <el-dialog
      title="选择患者"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="80%"
      :before-close="handleClose"
    >
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <!-- 搜索 -->
          <el-input v-model="query.blurry" clearable size="small" placeholder="输入患者名称/档案号/手机号进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
          <rrOperation />
        </div>
        <crudOperation :permission="permission" />
      </div>
      <!--表单组件-->
      <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="档案号" prop="mrn">
            <el-input v-model="form.mrn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="form.phone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        row-key="id"
        highlight-current-row
        @select="crud.selectChange"
        @select-all="crud.selectAllChange"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="名称" prop="name" />
        <el-table-column label="档案号" prop="mrn" />
        <el-table-column label="电话" prop="phone" />
        <el-table-column label="状态" prop="status" />
        <el-table-column label="备注" prop="remark" />
      </el-table>
      <!--分页组件-->
      <pagination />
      <!--按钮组-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :disabled="confirmButtonDisabled" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-input v-model="patientNames" :disabled="disabled" readonly style="width: 370px;" @focus="handleFocus">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="handlePatientClick" />
    </el-input>
  </span>
</template>

<script>
import crudApi from '@/api/yy/patient'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  name: null,
  mrn: null,
  phone: null,
  status: null,
  remark: null
}
export default {
  name: 'SelectPatient',
  components: { rrOperation, crudOperation, pagination },
  cruds() {
    return CRUD({
      title: '患者选择',
      url: 'api/yy/patient',
      query: { blurry: null },
      queryOnPresenterCreated: true,
      optShow: {
        add: false,
        edit: false,
        del: false,
        download: false,
        reset: false
      },
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  props: {
    multi: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: function() {
        return []
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        mrn: [
          { required: true, message: '请输入档案号', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
        ]
      },
      permission: {
      },
      dialogVisible: false,
      patientNames: this.getPatientNames(this.value),
      currentSelections: this.value,
      confirmButtonDisabled: true
    }
  },
  watch: {
    value: function(val) {
      this.currentSelections = val
      this.patientNames = this.getPatientNames(val)
      console.log(this.currentSelections)
      console.log(this.patientNames)
    },
    dialogVisible: function(val) {
      if (val && this.$refs.table) {
        this.$refs.table.clearSelection()
      }
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    },
    handleConfirm() {
      this.patientNames = this.getPatientNames(this.currentSelections)
      this.dialogVisible = false
      this.$emit('change', this.currentSelections)
    },
    getPatientNames(val) {
      let names = ''
      if (val) {
        for (let i = 0; i < val.length; i++) {
          if (names !== '') {
            names += ','
          }
          names += val[i].name
        }
      }
      return names
    },
    handleSelectionChange(selection) {
      this.crud.selectionChangeHandler(selection)
      this.currentSelections = selection
      let confirmButtonDisabled = true
      if (selection) {
        if ((!this.multi && selection.length === 1) || (this.multi && selection.length > 0)) {
          confirmButtonDisabled = false
        }
      }
      this.confirmButtonDisabled = confirmButtonDisabled
    },
    handleRowClick(row) {
      this.$refs['table'].toggleRowSelection(row)
    },
    handlePatientClick() {
      this.dialogVisible = true
    },
    handleFocus(val) {
      if (val) {
        this.handlePatientClick()
      }
    }
  }
}
</script>
<style></style>
