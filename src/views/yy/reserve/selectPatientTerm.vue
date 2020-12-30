<template>
  <span>
    <el-dialog
      title="选择患者套餐"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="80%"
      :before-close="handleClose"
    >
      <!--工具栏-->
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <!-- 搜索 -->
          <el-input v-model="query.blurry" clearable size="small" placeholder="输入套餐名称/编码进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
          <rrOperation />
        </div>
        <crudOperation :permission="permission" />
      </div>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        row-key="id"
        @select="crud.selectChange"
        @select-all="crud.selectAllChange"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="患者" prop="patient.name" />
        <el-table-column label="套餐编码" prop="termCode" />
        <el-table-column label="套餐名称" prop="termName" />
        <el-table-column label="套餐现价" prop="termPrice">
          <template slot-scope="scope">
            {{ parseMoney(scope.row.termPrice) }}
          </template>
        </el-table-column>
        <el-table-column label="套餐原价" prop="termOriginalPrice">
          <template slot-scope="scope">
            {{ parseMoney(scope.row.termOriginalPrice) }}
          </template>
        </el-table-column>
        <el-table-column label="套餐次数" prop="termTimes" />
        <el-table-column label="套餐单位" prop="termUnit" />
        <el-table-column label="实际支付" prop="price">
          <template slot-scope="scope">
            {{ parseMoney(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column label="剩余次数" prop="times" />
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
    <el-input v-model="patientTermNames" :disabled="disabled" readonly style="width: 370px;" @focus="handleFocus">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="handlePatientTermClick" />
    </el-input>
  </span>
</template>

<script>
import crudApi from '@/api/yy/patientTerm'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
}
export default {
  name: 'SelectPatientTerm',
  components: { rrOperation, crudOperation, pagination },
  cruds() {
    return CRUD({
      title: '患者套餐选择',
      url: 'api/yy/patientTerm',
      query: {
        blurry: null,
        patientId: null
      },
      queryOnPresenterCreated: false,
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
    disabled: {
      type: Boolean,
      default: false
    },
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
    patient: {
      type: Object,
      default: function() {
        return { id: null }
      }
    }
  },
  data: function() {
    return {
      rules: {
      },
      permission: {
      },
      currentPatient: this.patient,
      dialogVisible: false,
      patientTermNames: this.getPatientTermNames(this.value),
      currentSelections: this.value,
      confirmButtonDisabled: true
    }
  },
  watch: {
    value: function(val) {
      this.currentSelections = val
      this.patientTermNames = this.getPatientTermNames(val)
    },
    patient: function(val) {
      this.currentPatient = val
    }
  },
  methods: {
    handleClose() {
      console.log('close')
    },
    handleCancel() {
      this.dialogVisible = false
    },
    handleConfirm() {
      this.patientTermNames = this.getPatientTermNames(this.currentSelections)
      this.dialogVisible = false
      this.$emit('change', this.currentSelections)
    },
    getPatientTermNames(val) {
      let names = ''
      if (val) {
        for (let i = 0; i < val.length; i++) {
          if (names !== '') {
            names += ','
          }
          names += val[i].termName
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
    handlePatientTermClick() {
      this.dialogVisible = true
      this.query.patientId = this.currentPatient.id
      this.crud.toQuery()
    },
    handleFocus(val) {
      if (val) {
        this.handlePatientTermClick()
      }
    }
  }
}
</script>
<style></style>
