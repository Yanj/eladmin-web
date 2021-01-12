<template>
  <div class="app-container">
    <!--工具栏-->
    <div v-show="showHeader" class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable size="small" placeholder="输入套餐名称/编码进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-input v-model="query.patientName" clearable size="small" placeholder="输入患者名称进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="患者" prop="patient">
          <select-patient :value="currentPatients" :disabled="form.id != null" @change="handlePatientsChange" />
        </el-form-item>
        <el-form-item label="套餐" prop="term">
          <select-term :value="currentTerms" :disabled="form.id != null" @change="handleTermsChange" />
        </el-form-item>
        <el-form-item label="套餐编码" prop="termCode">
          <el-input v-model="form.termCode" :disabled="true" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐名称" prop="termName">
          <el-input v-model="form.termName" :disabled="true" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐现价" prop="editTermPrice">
          <currency-input v-model="form.editTermPrice" :disabled="true" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐原价" prop="editTermOriginalPrice">
          <currency-input v-model="form.editTermOriginalPrice" :disabled="true" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐次数" prop="termTimes">
          <el-input-number v-model.number="form.termTimes" :disabled="true" :min="0" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐单位" prop="termUnit">
          <el-input v-model="form.termUnit" :disabled="true" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="实际支付" prop="editPrice">
          <currency-input v-model="form.editPrice" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="剩余次数" prop="times">
          <el-input-number v-model.number="form.times" :min="0" :max="999" controls-position="right" style="width: 370px;" />
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
      @selection-change="crud.selectionChangeHandler"
      @current-change="handleCurrentChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="患者" prop="patient.name" />
      <el-table-column label="套餐编码" prop="termCode" />
      <el-table-column label="套餐名称" prop="termName" />
      <el-table-column label="套餐现价(元)" prop="termPrice">
        <template slot-scope="scope">
          {{ parseMoney(scope.row.termPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="套餐原价(元)" prop="termOriginalPrice">
        <template slot-scope="scope">
          {{ parseMoney(scope.row.termOriginalPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="套餐次数">
        <template slot-scope="scope">
          {{ scope.row.termTimes }} {{ scope.row.termUnit }}
        </template>
      </el-table-column>
      <el-table-column label="实际支付" prop="price">
        <template slot-scope="scope">
          {{ parseMoney(scope.row.price) }}
        </template>
      </el-table-column>
      <el-table-column label="剩余次数">
        <template slot-scope="scope">
          {{ scope.row.times }} {{ scope.row.termUnit }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" />
      <el-table-column v-permission="['admin','patientTerm:edit','patientTerm:del']" label="操作" width="130px" align="center" fixed="right">
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
  </div>
</template>

<script>
import crudApi from '@/api/yy/patientTerm'
import CurrencyInput from '@/views/components/CurrencyInput'
import SelectPatient from '@/views/yy/components/selectPatient'
import SelectTerm from '@/views/yy/components/selectTerm'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  patient: { id: null, name: null },
  termCode: null,
  termName: null,
  termPrice: null,
  editTermPrice: null,
  termOriginalPrice: null,
  editTermOriginalPrice: null,
  termTimes: null,
  termUnit: null,
  price: null,
  editPrice: null,
  times: null,
  status: null,
  remark: null
}
export default {
  name: 'PatientTerm',
  components: { crudOperation, rrOperation, udOperation, pagination, CurrencyInput, SelectPatient, SelectTerm },
  cruds() {
    return CRUD({
      title: '患者套餐管理',
      url: 'api/yy/patientTerm',
      query: {
        blurry: null,
        patientName: null,
        patientId: null
      },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  props: {
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rules: {
        termCode: [
          { required: true, message: '请输入套餐编码', trigger: 'blur' }
        ],
        termName: [
          { required: true, message: '请输入套餐名称', trigger: 'blur' }
        ],
        termTimes: [
          { required: true, message: '请输入套餐次数', trigger: 'blur' }
        ],
        termUnit: [
          { required: true, message: '请输入套餐单位', trigger: 'blur' }
        ],
        times: [
          { required: true, message: '请输入剩余次数', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'patientTerm:add'],
        edit: ['admin', 'patientTerm:edit'],
        del: ['admin', 'patientTerm:del']
      },
      selectPatientDialogVisible: false,
      currentPatients: [],
      currentTerms: [],
      currentTerm: { id: null }
    }
  },
  created() {
    if (this.showHeader) {
      setTimeout(() => {
        this.crud.toQuery()
      }, 500)
    }
  },
  methods: {
    // 刷新之后
    [CRUD.HOOK.afterRefresh](crud) {
      this.$emit('after-refresh', crud)
    },
    // 开始 "新建/编辑" - 之前
    [CRUD.HOOK.afterToCU](crud, form) {
      if (form.id) {
        this.currentPatientName = form.patient.name
        form.editPrice = this.parseMoney(form.price)
        form.editTermPrice = this.parseMoney(form.termPrice)
        form.editTermOriginalPrice = this.parseMoney(form.termOriginalPrice)
        this.currentPatients = [form.patient]
      } else {
        form.patient = { id: null, name: null }
        this.currentPatients = []
        this.currentTerm = { id: null }
        this.currentTerms = []
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.patient === null || this.form.patient.id === null) {
        this.$message({
          message: '患者不能为空',
          type: 'warning'
        })
        return false
      }
      // 提交前, 转换金额
      this.form.price = parseFloat(this.form.editPrice) * 100
      this.form.termPrice = parseFloat(this.form.editTermPrice) * 100
      this.form.termOriginalPrice = parseFloat(this.form.editTermOriginalPrice) * 100
      return true
    },
    // 表单填写 - 选择患者事件
    handlePatientsChange(val) {
      this.currentPatients = val
      if (val) {
        this.form.patient = val[0]
      }
    },
    // 表单填写 - 选择套餐事件
    handleTermsChange(val) {
      console.log(val)
      this.currentTerms = val
      if (val) {
        this.handleTermChange(val[0])
      }
    },
    handleTermChange(val) {
      if (val) {
        this.currentTerm = val
        this.form.termCode = val.code
        this.form.termName = val.name
        this.form.termPrice = val.price
        this.form.editTermPrice = this.parseMoney(val.price)
        this.form.termOriginalPrice = val.originalPrice
        this.form.editTermOriginalPrice = this.parseMoney(val.originalPrice)
        this.form.termTimes = val.times
        this.form.termUnit = val.unit
        this.form.price = val.price
        this.form.editPrice = this.parseMoney(val.price)
        this.form.times = val.times
      }
    },
    // 处理列表选中改变事件
    handleCurrentChange(row) {
      if (row) {
        this.$emit('current-change', row)
      }
    },
    // 清空表格选中
    clearSelection() {
      this.$refs.table.clearSelection()
    },
    // 清空数据
    clear() {
      this.crud.data = []
    },
    // 根据套餐编码设置选中行
    setCurrentRowByTermCode(termCode) {
      for (let i = 0; i < this.crud.data.length; i++) {
        if (this.crud.data[i].termCode === termCode) {
          this.$refs.table.setCurrentRow(this.crud.data[i])
          break
        }
      }
    },
    // 根据 id 刷新数据
    refreshRowById(id) {
      crudApi.getById(id).then(res => {
        console.log(res)
        for (let i = 0; i < this.crud.data.length; i++) {
          console.log(this.crud.data[i])
          if (res.id === this.crud.data[i].id) {
            // 更新数量
            this.crud.data[i].times = res.times
            break
          }
        }
      })
    }
  }
}
</script>

<style>
.my-autocomplete li {
  line-height: normal;
  padding: 7px;
}
.my-autocomplete li .name {
  text-overflow: ellipsis;
  overflow: hidden;
}
.my-autocomplete li .mrn {
  font-size: 12px;
  color: #b4b4b4;
}
.my-autocomplete li .highlighted .mrn {
  color: #ddd;
}
</style>

