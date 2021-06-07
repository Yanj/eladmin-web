<template>
  <div class="app-container">
    <!--工具栏-->
    <div v-show="showHeader" class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
        <el-date-picker v-model="query.date" type="date" value-format="yyyy-MM-dd" clearable size="small" class="filter-item" placeholder="选择日期" />
        <el-input v-model="query.patientName" clearable size="small" placeholder="输入患者名称进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.verifyStatus" clearable size="small" placeholder="选择核销状态搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.reserve_verify_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-if="hasAdminPermission" v-model="query.status" clearable size="small" placeholder="选择状态搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.reserve_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="120px">
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择部门', trigger:'blur'}]" label="部门">
          <dept-picker v-model="formDept" width="370" :disabled="disableEdit" @change="handleFormDeptChange" />
        </el-form-item>
        <el-form-item label="患者" prop="patient">
          <patient-picker :com-id="form.comId" :value="currentPatients" :disabled="form.id != null" @change="handlePatientsChange" />
        </el-form-item>
        <el-form-item label="患者套餐" prop="patient">
          <patient-term-picker :com-id="form.comId" :value="currentPatientTerms" :disabled="form.id != null" :patient="form.patient" @change="handlePatientTermsChange" />
        </el-form-item>
        <el-form-item label="套餐资源组" prop="resourceGroup">
          <resource-group-picker
            :value="form.resourceGroup"
            type="term"
            :disabled="form.id != null"
            :com-id="form.comId"
            :term-code="currentPatientTerm.termCode"
            style="width: 370px;"
            @change="handleResourceGroupChange"
          />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="form.date"
            :disabled="form.id != null && form.verifyStatus !== 'init'"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item label="时段">
          <work-time-picker
            :disabled="form.id != null && form.verifyStatus !== 'init'"
            :com-id="form.comId"
            :value="form.workTime"
            style="width: 370px;"
            @change="handleWorkTimeChange"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-input
            v-model="form.beginTime"
            :disabled="form.id != null && form.verifyStatus !== 'init'"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-input
            v-model="form.endTime"
            :disabled="form.id != null && form.verifyStatus !== 'init'"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择状态', trigger:'blur'}]" label="状态" prop="status">
          <el-select v-model="form.status" style="width: 370px;">
            <el-option v-for="item in dict.reserve_status" :key="item.id" :label="item.label" :value="item.value" />
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
      @select="crud.selectChange"
      @select-all="crud.selectAllChange"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="hasAdminPermission" label="组织ID" prop="orgId" />
      <el-table-column v-if="hasAdminPermission" label="医院ID" prop="comId" />
      <el-table-column v-if="hasAdminPermission" label="部门ID" prop="deptId" />
      <el-table-column label="预约时间" width="160">
        <template slot-scope="scope">
          <div>{{ scope.row.date }} {{ scope.row.beginTime }}-{{ scope.row.endTime }}</div>
        </template>
      </el-table-column>
      <el-table-column label="患者" prop="patient.name" width="80" />
      <el-table-column :show-overflow-tooltip="true" label="套餐" prop="patientTerm.termName" width="150" />
      <el-table-column :show-overflow-tooltip="true" label="资源组" prop="resourceGroup.name" width="100" />
      <el-table-column label="核销状态" prop="verifyStatus" width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.verifyStatus !== ''">{{ dict.label.reserve_verify_status[scope.row.verifyStatus] }}</span>
          <span v-else>{{ scope.row.verifyStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="hasAdminPermission" label="状态" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status !== ''">{{ dict.label.reserve_status[scope.row.status] }}</span>
          <span v-else>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" />
      <el-table-column v-permission="['admin','reserve:edit','reserve:del']" label="操作" width="200" align="center" fixed="right">
        <template slot-scope="scope">
          <div class="my-buttons">
            <div>
              <el-button
                v-if="scope.row.verifyStatus === 'init'"
                size="mini"
                type="success"
                @click="handleCheckIn(scope.row)"
              >签到</el-button>
              <el-button
                v-if="scope.row.verifyStatus === 'init'"
                size="mini"
                type="warning"
                @click="handleCancel(scope.row)"
              >作废</el-button>
              <el-button
                v-if="scope.row.verifyStatus === 'check_in'"
                size="mini"
                type="primary"
                @click="handleVerify(scope.row)"
              >核销</el-button>
              <el-button
                v-if="scope.row.verifyStatus === 'check_in'"
                size="mini"
                type="warning"
                @click="handleCancel(scope.row)"
              >作废</el-button>
              <span v-if="scope.row.verifyStatus === 'verified'">
                <el-button
                  v-permission="permission.del"
                  size="mini"
                  type="danger"
                  @click="handleCancel(scope.row)"
                >作废</el-button>
              </span>
              <el-button
                v-show="false"
                v-permission="permission.edit"
                :loading="crud.status.cu === 2"
                size="mini"
                type="primary"
                @click="crud.toEdit(scope.row)"
              >编辑</el-button>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
    <verify ref="verify" :value="currentReserve" @change="handleVerifyChange" />
  </div>
</template>

<script>
import crudApi from '@/api/patientReserve/reserve'

import resourceGroupPicker from './resourceGroupPicker'
import workTimePicker from './workTimePicker'
import patientPicker from '@/views/patientReserve/components/patientPicker'
import patientTermPicker from '@/views/patientReserve/components/patientTermPicker'
import verify from './verify'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

const defaultForm = {
  id: null,
  orgId: null,
  comId: null,
  deptId: null,
  patient: { id: null, name: null },
  patientTerm: { id: null, termName: null },
  resourceGroup: { id: null, name: null },
  workTime: { id: null },
  date: null,
  beginTime: null,
  endTime: null,
  verifyStatus: null,
  status: null,
  remark: null
}
export default {
  name: 'ReserveList',
  components: { crudOperation, rrOperation, pagination, resourceGroupPicker, workTimePicker, patientPicker, patientTermPicker, verify, deptPicker },
  cruds() {
    return CRUD({
      title: '预约管理',
      url: 'api/yy/reserve',
      queryOnPresenterCreated: true,
      query: {
        orgId: null,
        comId: null,
        deptId: null,
        date: null,
        workTimeId: null,
        termId: null,
        patientTermId: null,
        patientName: null,
        verifyStatus: null,
        status: null
      },
      optShow: {
        add: true,
        edit: false,
        del: false,
        download: true,
        reset: true
      },
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud(), hasAdminPermission()],
  // 数据字典
  dicts: ['reserve_status', 'reserve_verify_status'],
  props: {
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rules: {
        date: [
          { required: true, message: '请输入预约日期', trigger: 'blur' }
        ],
        beginTime: [
          { required: true, message: '请输入开始时间', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '请输入结束时间', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'reserve:add'],
        edit: ['admin', 'reserve:edit'],
        del: ['admin', 'reserve:del']
      },
      currentPatients: [],
      currentPatientTerms: [],
      currentPatientTerm: { id: null },
      currentReserve: null,
      preFormData: null,
      disableEdit: false,
      formDept: {
        orgId: null,
        comId: null,
        deptId: null
      }
    }
  },
  created() {
    const { query } = this.$route
    this.query.patientName = query.patientName
  },
  methods: {
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.crud.toQuery()
    },
    handleFormDeptChange(dept) {
      this.form.orgId = dept.orgId
      this.form.comId = dept.comId
      this.form.deptId = dept.deptId
    },
    // 开始 "新建/编辑" - 之前
    [CRUD.HOOK.afterToCU](crud, form) {
      if (!form.id) {
        form.patient = { id: null, name: null }
        form.patientTerm = { id: null, termName: null }
        form.resourceGroup = { id: null, name: null }
        form.workTime = { id: null }
        form.verifyStatus = 'init'
        this.currentPatients = []
        this.currentPatientTerms = []
        this.currentPatientTerm = { id: null }
        this.disableEdit = false
      } else {
        this.currentPatients = [form.patient]
        this.currentPatientTerms = [form.patientTerm]
        this.currentPatientTerm = form.patientTerm
        this.disableEdit = true
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
          message: '所属患者不能为空',
          type: 'warning'
        })
        return false
      }
      if (this.form.patientTerm === null || this.form.patientTerm.id === null) {
        this.$message({
          message: '所属患者套餐不能为空',
          type: 'warning'
        })
        return false
      }
      if (this.form.resourceGroup === null || this.form.resourceGroup.id === null) {
        this.$message({
          message: '所属套餐资源组不能为空',
          type: 'warning'
        })
        return false
      }
      if (this.form.workTime === null || this.form.workTime.id === null) {
        this.$message({
          message: '所属预约时段不能为空',
          type: 'warning'
        })
        return false
      }
      if (this.form.beginTime >= this.form.endTime) {
        this.$message({
          message: '开始时间必须大于结束时间',
          type: 'warning'
        })
        return false
      }
      this.form.orgId = this.formDept.orgId
      this.form.comId = this.formDept.comId
      this.form.deptId = this.formDept.deptId
      return true
    },
    // 提交之后
    [CRUD.HOOK.afterSubmit](crud) {
      this.$emit('after-submit')
    },
    // 表单填写 - 选择患者事件
    handlePatientsChange(val) {
      this.currentPatients = val
      if (val) {
        this.form.patient = val[0]
      }
      // 清空患者套餐选择
      this.currentPatientTerms = []
      this.currentPatientTerm = { id: null }
      this.form.patientTerm = { id: null }
      // this.form.term = { id: null }
      // 清空套餐资源组
      this.form.resourceGroup = { id: null, name: null }
    },
    // 表单填写 - 选择患者项目事件
    handlePatientTermsChange(val) {
      this.currentPatientTerms = val
      if (val) {
        this.currentPatientTerm = val[0]
        this.form.patientTerm = val[0]
      }
      // 清空套餐资源组
      this.form.resourceGroup = { id: null, name: null }
    },
    // 表单填写 - 选择资源组事件
    handleResourceGroupChange(val) {
      this.form.resourceGroup = val
    },
    // 表单填写 - 选择预约时段事件
    handleWorkTimeChange(val) {
      this.form.workTime = val
      this.form.beginTime = val.beginTime
      this.form.endTime = val.endTime
    },
    // 开始签到
    handleCheckIn(row) {
      crudApi.checkIn(row).then(res => {
        this.updateCrudData(res)
      })
    },
    // 开始取消
    handleCancel(row) {
      this.$confirm('当前记录的状态为[' + this.dict.label.reserve_verify_status[row.verifyStatus] + '], 废除后将归还患者次数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudApi.cancel(row).then(res => {
          this.updateCrudData(res)
          // 发送取消成功事件
          this.$emit('after-cancel')
        })
      }).catch(() => {
      })
    },
    // 打开核销对话框
    handleVerify(row) {
      this.currentReserve = row
      this.$refs.verify.dialogVisible = true
    },
    // 开始核销
    handleVerifyChange(val) {
      crudApi.verify(val).then(res => {
        this.updateCrudData(res)
      })
    },
    // 更新表格数据
    updateCrudData(res) {
      console.log(res)
      if (res) {
        for (let i = 0; i < this.crud.data.length; i++) {
          console.log(this.crud.data[i].id)
          if (res.id === this.crud.data[i].id) {
            // this.crud.data[i] = res
            this.crud.data[i].verifyStatus = res.verifyStatus
            break
          }
        }
      }
    },
    // 清空表格选中
    clearSelection() {
      this.$refs.table.clearSelection()
    },
    // 清空数据
    clear() {
      this.crud.data = []
    }
  }
}
</script>

<style scoped>
.my-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.my-buttons > div {
  display: inline-block;
}
.my-buttons > div button {
  margin-left: 5px;
}
</style>
