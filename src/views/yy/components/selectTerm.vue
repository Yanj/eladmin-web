<template>
  <span>
    <el-dialog
      title="选择套餐"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="80%"
      :before-close="handleClose"
    >
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <!-- 搜索 -->
          <hospital-picker
            :value="currentHospital"
            @change="handleHospitalChange"
          />
          <rrOperation />
        </div>
        <crudOperation :permission="permission" />
      </div>
      <!--表单组件-->
      <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item v-show="false" label="医院">
            <hospital-picker :value="currentHospital" :disabled="true" />
          </el-form-item>
          <el-form-item label="编码" prop="code">
            <el-input v-model="form.code" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="现价" prop="editPrice">
            <currency-input v-model="form.editPrice" :decimal="2" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="原价" prop="editOriginalPrice">
            <currency-input v-model="form.editOriginalPrice" :decimal="2" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="次数" prop="times">
            <el-input v-model="form.times" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <div style="display:flex;">
        <div style="flex:3">
          <el-card class="box-card" shadow="never">
            <div slot="header" class="clearfix">
              <span class="role-span">套餐列表</span>
            </div>
            <!--表格渲染-->
            <el-table
              ref="table"
              v-loading="crud.loading"
              highlight-current-row
              :data="crud.data"
              row-key="id"
              @select="crud.selectChange"
              @select-all="crud.selectAllChange"
              @selection-change="handleSelectionChange"
              @row-click="handleRowClick"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column label="编码" prop="code" width="120" />
              <el-table-column label="名称" prop="name" />
              <el-table-column label="现价(元)" prop="price" width="100">
                <template slot-scope="scope">
                  {{ parseMoney(scope.row.price) }}
                </template>
              </el-table-column>
              <el-table-column label="原价(元)" prop="originalPrice" width="100">
                <template slot-scope="scope">
                  {{ parseMoney(scope.row.originalPrice) }}
                </template>
              </el-table-column>
              <el-table-column label="次数" width="150">
                <template slot-scope="scope">
                  {{ scope.row.times }} {{ scope.row.unit }}
                </template>
              </el-table-column>
              <el-table-column v-permission="['admin','term:edit','term:del']" label="操作" width="130px" align="center" fixed="right">
                <template slot-scope="scope">
                  <udOperation
                    :data="scope.row"
                    :permission="permission"
                    msg="确定删除吗?"
                  />
                </template>
              </el-table-column>
            </el-table>
            <!--分页组件-->
            <pagination />
          </el-card>
        </div>
      </div>
      <!--按钮组-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :disabled="confirmButtonDisabled" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-input v-model="termNames" :disabled="disabled" readonly style="width: 370px;" @focus="handleFocus">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="handleTermClick" />
    </el-input>
  </span>
</template>

<script>
import crudApi from '@/api/yy/term'
import hospitalPicker from '@/views/yy/hospital/hospitalPicker'
import CurrencyInput from '@/views/components/CurrencyInput'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  dept: { id: null },
  code: null,
  name: null,
  price: null,
  editPrice: null,
  originalPrice: null,
  editOriginalPrice: null,
  times: null,
  unit: null,
  status: null,
  remark: null
}
export default {
  name: 'SelectTerm',
  components: { rrOperation, crudOperation, udOperation, pagination, hospitalPicker, CurrencyInput },
  cruds() {
    return CRUD({
      title: '套餐选择',
      url: 'api/yy/term',
      query: { deptId: null },
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
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        editPrice: [
          { required: true, message: '请输入现价', trigger: 'blur' }
        ],
        editOriginalPrice: [
          { required: true, message: '请输入原价', trigger: 'blur' }
        ],
        times: [
          { required: true, message: '请输入次数', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请输入单位', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'term:add'],
        edit: ['admin', 'term:edit'],
        del: ['admin', 'term:del'],
        editResourceGroup: ['admin', 'term:editResourceGroup']
      },
      currentHospital: null,
      dialogVisible: false,
      termNames: this.getTermNames(this.value),
      currentSelections: this.value,
      confirmButtonDisabled: true
    }
  },
  watch: {
    value: function(val) {
      this.currentSelections = val
      this.termNames = this.getTermNames(val)
      console.log(this.currentSelections)
      console.log(this.termNames)
    },
    dialogVisible: function(val) {
      if (val && this.$refs.table) {
        this.$refs.table.clearSelection()
      }
    }
  },
  methods: {
    // 新增或者编辑之前
    [CRUD.HOOK.beforeToCU](crud, form) {
      // 编辑: 转换金额
      if (form.id) {
        form.editPrice = this.parseMoney(form.price)
        form.editOriginalPrice = this.parseMoney(form.originalPrice)
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.dept === null || this.form.dept.id === null) {
        this.form.dept = this.currentHospital
      }
      if (this.form.dept === null || this.form.dept.id === null) {
        this.$message({
          message: '所属医院不能为空',
          type: 'warning'
        })
        return false
      }
      // 提交前, 转换金额
      this.form.price = parseFloat(this.form.editPrice) * 100
      this.form.originalPrice = parseFloat(this.form.editOriginalPrice) * 100
      return true
    },
    // 选择的医院改变
    handleHospitalChange(val) {
      this.currentHospital = val
      this.query.deptId = val.id
      this.crud.toQuery()
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    },
    handleConfirm() {
      this.termNames = this.getTermNames(this.currentSelections)
      this.dialogVisible = false
      this.$emit('change', this.currentSelections)
    },
    getTermNames(val) {
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
    handleTermClick() {
      this.dialogVisible = true
    },
    handleFocus(val) {
      if (val) {
        this.handleTermClick()
      }
    }
  }
}
</script>
<style></style>
