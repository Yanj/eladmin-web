<template>
  <div class="app-container">
    <!--工具栏-->
    <div v-show="showHeader" class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <hospital-picker
          :value="currentHospital"
          :disabled="!showHeader"
          @change="handleHospitalChange"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="120px">
        <el-form-item label="医院">
          <hospital-picker :value="currentHospital" :disabled="true" />
        </el-form-item>
        <el-form-item label="患者" prop="patient">
          <select-patient :value="currentPatients" :disabled="form.id != null" @change="handlePatientsChange" />
        </el-form-item>
        <el-form-item label="患者套餐" prop="patient">
          <select-patient-term :value="currentPatientTerms" :disabled="form.id != null" :patient="form.patient" @change="handlePatientTermsChange" />
        </el-form-item>
        <el-form-item label="套餐资源组" prop="resourceGroup">
          <resource-group-picker
            :value="form.resourceGroup"
            type="term"
            :disabled="form.id != null"
            :dept-id="currentHospital.id"
            :term-code="currentPatientTerm.termCode"
            style="width: 370px;"
            @change="handleResourceGroupChange"
          />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="form.date"
            :disabled="form.id != null && form.status !== 'init'"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item label="时段">
          <work-time-picker
            :disabled="form.id != null && form.status !== 'init'"
            :dept-id="currentHospital.id"
            :value="form.workTime"
            style="width: 370px;"
            @change="handleWorkTimeChange"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-input
            v-model="form.beginTime"
            :disabled="form.id != null && form.status !== 'init'"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-input
            v-model="form.endTime"
            :disabled="form.id != null && form.status !== 'init'"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-input
            :value="dict.label.reserve_status[form.status]"
            :disabled="true"
            style="width: 370px;"
          />
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
      <el-table-column label="医院" prop="dept.name" />
      <el-table-column label="患者" prop="patient.name" />
      <el-table-column label="套餐" prop="patientTerm.termName" />
      <el-table-column label="资源组" prop="resourceGroup.name" />
      <el-table-column label="日期" prop="date" />
      <el-table-column label="开始时间" prop="beginTime" />
      <el-table-column label="结束时间" prop="endTime" />
      <el-table-column label="状态" prop="status">
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
                v-if="scope.row.status === 'init'"
                size="mini"
                type="success"
                @click="handleCheckIn(scope.row)"
              >签到</el-button>
              <el-button
                v-if="scope.row.status === 'init'"
                size="mini"
                type="warning"
                @click="handleCancel(scope.row)"
              >作废</el-button>
              <el-button
                v-if="scope.row.status === 'check_in'"
                size="mini"
                type="primary"
                @click="handleVerify(scope.row)"
              >核销</el-button>
              <el-button
                v-if="scope.row.status === 'verified'"
                v-permission="permission.del"
                size="mini"
                type="danger"
                @click="handleCancel(scope.row)"
              >作废</el-button>
              <el-button
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
import crudApi from '@/api/yy/reserve'
import hospitalPicker from '@/views/yy/hospital/hospitalPicker'
import resourceGroupPicker from '@/views/yy/resourceGroup/resourceGroupPicker'
import workTimePicker from '@/views/yy/workTime/workTimePicker'
import selectPatient from '@/views/yy/reserve/selectPatient'
import selectPatientTerm from '@/views/yy/reserve/selectPatientTerm'
import verify from '@/views/yy/reserve/verify'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  dept: { id: null, name: null },
  patient: { id: null, name: null },
  patientTerm: { id: null, termName: null },
  resourceGroup: { id: null, name: null },
  workTime: { id: null },
  date: null,
  beginTime: null,
  endTime: null,
  status: null,
  remark: null
}
export default {
  name: 'Reserve',
  components: { crudOperation, rrOperation, pagination, hospitalPicker, resourceGroupPicker, workTimePicker, selectPatient, selectPatientTerm, verify },
  cruds() {
    return CRUD({
      title: '预约管理',
      url: 'api/yy/reserve',
      queryOnPresenterCreated: false,
      query: {
        deptId: null,
        date: null,
        workTimeId: null,
        termId: null,
        patientTermId: null
      },
      optShow: {
        add: true,
        edit: true,
        del: false,
        download: true,
        reset: true
      },
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
  // 数据字典
  dicts: ['reserve_status'],
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
      currentHospital: { id: null },
      currentPatients: [],
      currentPatientTerms: [],
      currentPatientTerm: { id: null },
      currentReserve: null,
      preFormData: null
    }
  },
  watch: {
  },
  created() {
  },
  methods: {
    // 开始 "新建/编辑" - 之前
    [CRUD.HOOK.afterToCU](crud, form) {
      console.log(form)
      if (this.showHeader) { // 显示头部, 表示正常进入页面的
        if (form.id == null) {
          form.dept = this.currentHospital
          form.patient = { id: null, name: null }
          form.patientTerm = { id: null, termName: null }
          form.resourceGroup = { id: null, name: null }
          form.workTime = { id: null }
          form.status = 'init'
          this.currentPatients = []
          this.currentPatientTerms = []
          this.currentPatientTerm = { id: null }
        } else {
          this.currentPatients = [form.patient]
          this.currentPatientTerms = [form.patientTerm]
          this.currentPatientTerm = form.patientTerm
        }
      } else { // 不显示头部, 表示其它组件
        if (this.preFormData) {
          this.currentHospital = this.preFormData.dept
          form.dept = this.preFormData.dept
          form.patient = this.preFormData.patient
          form.patientTerm = this.preFormData.patientTerm
          form.resourceGroup = { id: null, name: null }
          form.date = this.preFormData.date
          if (this.preFormData.workTime) {
            form.workTime = this.preFormData.workTime
            form.beginTime = this.preFormData.workTime.beginTime
            form.endTime = this.preFormData.workTime.endTime
          } else {
            form.workTime = { id: null }
          }
          form.status = 'init'
          this.currentPatients = [form.patient]
          this.currentPatientTerms = [form.patientTerm]
          this.currentPatientTerm = form.patientTerm
        }
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
      return true
    },
    // 提交之后
    [CRUD.HOOK.afterSubmit](crud) {
      this.$emit('after-submit')
    },
    // 查询 - 选择医院事件
    handleHospitalChange(val) {
      console.log('[handle changed]hospital:' + val.id)
      this.currentHospital = val
      this.query.deptId = val.id
      this.crud.toQuery()
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
      this.$confirm('当前记录的状态为[' + this.dict.label.reserve_status[row.status] + '], 废除后将归还患者次数, 是否继续?', '提示', {
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
            this.crud.data[i].status = res.status
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

