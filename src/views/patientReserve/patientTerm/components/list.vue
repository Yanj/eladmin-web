<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <template v-if="hasAdminPermission && !isPickerMode">
          <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
        </template>
        <el-input v-model="query.blurry" clearable size="small" placeholder="输入套餐名称/编码进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-input v-model="query.patientName" clearable size="small" placeholder="输入患者名称进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.type" clearable size="small" placeholder="选择类型搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.patient_term_type" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-if="hasAdminPermission && !isPickerMode" v-model="query.status" clearable size="small" placeholder="选择状态搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.patient_term_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission">
        <template v-if="hasAdminPermission && !isPickerMode" v-slot:right>
          <el-button
            v-permission="permission.freeOne"
            class="filter-item"
            size="mini"
            type="warning"
            :disabled="!canAddFreeOne"
            @click="createFreeOne"
          >赠送一次</el-button>
          <el-button
            v-permission="permission.freeTwo"
            class="filter-item"
            size="mini"
            type="warning"
            :disabled="!canAddFreeTwo"
            @click="createFreeTwo"
          >赠送两次</el-button>
        </template>
      </crudOperation>
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="570px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="120px">
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择部门', trigger:'blur'}]" label="部门">
          <dept-picker v-model="formDept" width="370" :disabled="disableEdit" />
        </el-form-item>
        <el-form-item label="患者" prop="patient">
          <patient-picker :com-id="form.comId" :value="currentPatients" :disabled="form.id != null" @change="handlePatientsChange" />
        </el-form-item>
        <el-form-item label="套餐" prop="term">
          <term-picker :value="currentTerms" :disabled="form.id != null" @change="handleTermsChange" />
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
        <el-form-item label="套餐时长" prop="termDuration">
          <el-input v-model="form.termDuration" :disabled="true" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐操作员个数" prop="termOperatorCount">
          <el-input v-model="form.termOperatorCount" :disabled="true" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="实际支付" prop="editPrice">
          <currency-input v-model="form.editPrice" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="剩余次数" prop="times">
          <el-input-number v-model.number="form.times" :min="0" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="时长" prop="duration">
          <el-input-number v-model.number="form.duration" :min="30" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="操作员个数" prop="operatorCount">
          <el-input-number v-model.number="form.operatorCount" :min="1" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择状态', trigger:'blur'}]" label="状态" prop="status">
          <el-select v-model="form.status" style="width: 370px;">
            <el-option v-for="item in dict.patient_term_status" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
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
      @current-change="handleCurrentChange"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="hasAdminPermission" label="组织ID" prop="orgId" />
      <el-table-column v-if="hasAdminPermission" label="医院ID" prop="comId" />
      <el-table-column v-if="hasAdminPermission" label="部门ID" prop="deptId" />
      <el-table-column label="购买ID" prop="patItemId" />
      <el-table-column label="患者" prop="patient.name" />
      <el-table-column label="套餐类型">
        <template slot-scope="scope">
          {{ dict.label.patient_term_type[scope.row.type] }}
        </template>
      </el-table-column>
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
      <el-table-column v-if="hasAdminPermission" label="状态" prop="status" width="100">
        <template slot-scope="scope">
          {{ dict.label.patient_term_status[scope.row.status] }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" />
      <el-table-column v-if="!isPickerMode" v-permission="['admin','patientTerm:edit','patientTerm:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudApi from '@/api/patientReserve/patientTerm'

import CurrencyInput from '@/views/components/CurrencyInput'

import patientPicker from '@/views/patientReserve/components/patientPicker'
import termPicker from '@/views/patientReserve/components/termPicker'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

const defaultForm = {
  id: null,
  orgId: null,
  comId: null,
  deptId: null,
  patient: { id: null, name: null },
  termCode: null,
  termName: null,
  termPrice: null,
  editTermPrice: null,
  termOriginalPrice: null,
  editTermOriginalPrice: null,
  termTimes: null,
  termUnit: null,
  termDuration: null,
  termOperatorCount: null,
  price: null,
  editPrice: null,
  totalTimes: null,
  times: null,
  duration: null,
  operatorCount: null,
  status: null,
  remark: null
}
export default {
  name: 'PatientTerm',
  components: { crudOperation, rrOperation, udOperation, pagination, CurrencyInput, patientPicker, termPicker, deptPicker },
  cruds() {
    return CRUD({
      title: '患者套餐管理',
      url: 'api/yy/patientTerm',
      query: {
        orgId: null,
        comId: null,
        deptId: null,
        blurry: null,
        patientName: null,
        type: null,
        patientId: null
      },
      queryOnPresenterCreated: true,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud(), hasAdminPermission()],
  dicts: ['patient_term_status', 'patient_term_type'],
  props: {
    mode: {
      type: String,
      default: 'list' || 'picker'
    },
    patientId: {
      type: [String, Number],
      default: null
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
        del: ['admin', 'patientTerm:del'],
        freeOne: ['admin', 'patientTerm:freeOne'],
        freeTwo: ['admin', 'patientTerm:freeTwo']
      },
      selectPatientDialogVisible: false,
      currentPatients: [],
      currentTerms: [],
      currentTerm: { id: null },
      canAddFreeOne: false,
      canAddFreeTwo: false,
      disableEdit: false,
      formDept: {
        orgId: null,
        comId: null,
        deptId: null
      }
    }
  },
  computed: {
    isPickerMode: function() {
      return this.mode === 'picker'
    }
  },
  created() {
    if (this.isPickerMode) {
      this.crud.optShow = {
        add: false,
        edit: false,
        del: false,
        download: false,
        reset: false
      }
    }
  },
  methods: {
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.crud.toQuery()
    },
    // 刷新之前
    [CRUD.HOOK.beforeRefresh](crud) {
      console.log(this.patientId)
      if (this.isPickerMode) {
        this.query.patientId = this.patientId
        this.query.status = '1'
      }
    },
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
        this.disableEdit = true
      } else {
        form.patient = { id: null, name: null }
        this.currentPatients = []
        this.currentTerm = { id: null }
        this.currentTerms = []
        this.disableEdit = false
      }
      this.formDept = {
        orgId: form.orgId,
        comId: form.comId,
        deptId: form.deptId
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
      this.form.orgId = this.formDept.orgId
      this.form.comId = this.formDept.comId
      this.form.deptId = this.formDept.deptId
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
        this.form.termDuration = val.duration
        this.form.termOperatorCount = val.operatorCount

        this.form.price = val.price
        this.form.editPrice = this.parseMoney(val.price)
        this.form.times = val.times
        this.form.duration = val.duration
        this.form.operatorCount = val.operatorCount
      }
    },
    createFreeOne() {
      crudApi.addFreeOne(this.crud.selections[0]).then(res => {
        this.crud.toQuery()
      })
    },
    createFreeTwo() {
      crudApi.addFreeTwo(this.crud.selections[0]).then(res => {
        this.crud.toQuery()
      })
    },
    handleSelectionChange(selection) {
      this.crud.selectionChangeHandler(selection)
      let canAddFreeOne = false
      let canAddFreeTwo = false
      if (this.crud.selections.length === 1) {
        const sel = this.crud.selections[0]
        console.log(sel)
        if (sel.patItemId && (!sel.freeTimes || sel.freeTimes < 1)) {
          canAddFreeOne = true
        }
        if (sel.patItemId && (!sel.freeTimes || sel.freeTimes < 2)) {
          canAddFreeTwo = true
        }
      }
      this.canAddFreeOne = canAddFreeOne
      this.canAddFreeTwo = canAddFreeTwo
      this.$emit('selection-change', selection)
    },
    handleRowClick(row) {
      this.$refs['table'].toggleRowSelection(row)
    },
    // 处理列表选中改变事件
    handleCurrentChange(row) {
      if (row) {
        this.$emit('current-change', row)
      }
    },
    // 刷新数据
    refreshTable() {
      this.crud.toQuery()
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
