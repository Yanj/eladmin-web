<template>
  <el-dialog
    title="选择患者套餐"
    :visible.sync="dialogVisible"
    width="100%"
  >
    <div class="container">
      <div class="header-container">
        <div class="search-container">
          <div style="display: flex; flex-direction: row; align-items: center; margin-right: 20px;">
            <!-- 搜索 -->
            <el-select v-model="query.infoType" placeholder="请选择" style="width:100px;">
              <el-option label="电话" value="PHONE" />
              <el-option label="姓名" value="NAME" />
              <el-option label="病案号" value="MRN" />
            </el-select>
            <el-input v-model="query.patientInfo" clearable size="small" placeholder="输入查询条件" style="margin-left:10px; width: 200px;" />
          </div>
          <div class="buttons">
            <el-button type="primary" @click="handleQuery">精准搜索</el-button>
            <el-button type="primary" :disabled="currentPatientTerm == null" style="float:right;" @click="handleAdd">新增</el-button>
          </div>
        </div>
      </div>
      <div class="body-container">
        <el-row :gutter="10" style="margin-top: 10px">
          <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11">
            <el-card class="box-card">
              <el-tooltip class="item" effect="dark" content="数据查询条件同步患者信息" placement="top">
                <span class="role-span">患者列表</span>
              </el-tooltip>
              <patient ref="patientList" :show-header="false" @current-change="handlePatientChange" />
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
            <el-card class="box-card">
              <el-tooltip class="item" effect="dark" content="选择指定患者查看患者套餐列表" placement="top">
                <span class="role-span">患者套餐列表</span>
              </el-tooltip>
              <patient-term ref="patientTermList" :show-header="false" @current-change="handlePatientTermChange" />
            </el-card>
          </el-col>
        </el-row>
        <div style="margin-top: 10px;">
          <reserve ref="reserveList" :show-header="false" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { syncPatient } from '@/api/yy/patient'
import Patient from '@/views/yy/patient'
import PatientTerm from '@/views/yy/patientTerm'
import Reserve from '@/views/yy/reserve'

export default {
  name: 'QueryPatient',
  components: { Patient, PatientTerm, Reserve },
  data: function() {
    return {
      dialogVisible: false,
      query: { infoType: null, patientInfo: null },
      dept: { id: null, name: null },
      workTime: { id: null },
      date: null,
      term: { id: null },
      currentPatient: null,
      currentPatientTerm: null
    }
  },
  methods: {
    show() {
      // 清空患者列表
      this.clearPatientList()
      // 清空患者套餐列表
      this.clearPatientTermList()
      this.dialogVisible = true
    },
    hide() {
      this.dialogVisible = false
    },
    handleQuery() {
      // 打开加载中
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      // 同步患者信息
      syncPatient(this.query).then(res => {
        // 关闭弹窗
        loading.close()
        if (res) {
          if (Object.keys(res).length > 0) {
            let msg = ''
            for (const item in res) {
              if (res.hasOwnProperty(item)) {
                if (msg.length > 0) {
                  msg += ','
                }
                msg += '' + item + '=' + res[item]
              }
            }
            this.$confirm('套餐不存在: ' + msg, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              // 查询患者列表
              this.loadPatientList()
            }).catch(() => {
              // 查询患者列表
              this.loadPatientList()
            })
            return
          }
        }

        // 查询患者列表
        this.loadPatientList()
      }).catch(() => {
        loading.close()
      })
    },
    // 查询患者列表
    loadPatientList() {
      if (this.query.infoType === 'PHONE') {
        this.$refs.patientList.query.mrn = null
        this.$refs.patientList.query.name = null
        this.$refs.patientList.query.phone = this.query.patientInfo
      } else if (this.query.infoType === 'NAME') {
        this.$refs.patientList.query.mrn = null
        this.$refs.patientList.query.name = this.query.patientInfo
        this.$refs.patientList.query.phone = null
      } else if (this.query.infoType === 'MRN') {
        this.$refs.patientList.query.mrn = this.query.patientInfo
        this.$refs.patientList.query.name = null
        this.$refs.patientList.query.phone = null
      }
      this.$refs.patientList.crud.toQuery()
    },
    // 情况患者列表
    clearPatientList() {
    },
    handlePatientChange(row) {
      console.log(row)
      this.currentPatient = row
      // 查询患者套餐列表
      this.loadPatientTermList(row.id)
    },
    // 查询患者套餐列表
    loadPatientTermList(patientId) {
      this.$refs.patientTermList.query.patientId = patientId
      this.$refs.patientTermList.crud.toQuery()
    },
    // 清空患者套餐列表
    clearPatientTermList() {
    },
    // 选中患者套餐处理
    handlePatientTermChange(row) {
      console.log(row)
      this.currentPatientTerm = row
      this.$refs.reserveList.query.deptId = this.dept.id
      this.$refs.reserveList.query.patientTermId = row.id
      this.$refs.reserveList.crud.toQuery()
    },
    handleAdd() {
      this.$refs.reserveList.preFormData = {
        dept: this.dept,
        patient: this.currentPatient,
        patientTerm: this.currentPatientTerm,
        workTime: this.workTime,
        date: this.date
      }
      this.$refs.reserveList.crud.toAdd()
    }
  }
}
</script>

<style>
.search-container {
  width: 100%;
  display: flex;
  align-items: center;
}
.buttons {
  flex: 1;
}
</style>
