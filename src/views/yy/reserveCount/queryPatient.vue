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
        <el-card class="box-card" style="margin-top: 20px">
          <el-tooltip class="item" effect="dark" content="数据查询条件同步患者信息" placement="top">
            <span class="role-span">患者列表</span>
          </el-tooltip>
          <patient ref="patientList" :show-header="false" @current-change="handlePatientChange" @after-refresh="handlePatientAfterRefresh" />
        </el-card>
        <el-card class="box-card" style="margin-top: 20px">
          <el-tooltip class="item" effect="dark" content="选择指定患者查看患者套餐列表" placement="top">
            <span class="role-span">患者套餐列表</span>
          </el-tooltip>
          <patient-term ref="patientTermList" :show-header="false" @current-change="handlePatientTermChange" @after-refresh="handlePatientTermAfterRefresh" />
        </el-card>
        <el-card class="box-card" style="margin-top: 20px">
          <el-tooltip class="item" effect="dark" content="选择指定患者查看患者套餐列表" placement="top">
            <span class="role-span">患者套餐已预约列表</span>
          </el-tooltip>
          <reserve ref="reserveList" :show-header="false" @after-submit="handleReserveAfterSubmit" @after-cancel="handleReserveAfterCancel" />
        </el-card>
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
      dept: { id: null, name: null }, // 外部传入: 部门
      workTime: { id: null }, // 外部传入: 预约时段
      date: null, // 外部传入: 预约日期
      term: { code: null }, // 外部传入: 套餐
      currentPatient: null, // 当前选中患者
      currentPatientTerm: null, // 当前选中患者套餐
      hasAnythingChanged: false // 是否有数据改变
    }
  },
  watch: {
    dialogVisible: function(val) {
      // 有改变, 发布事件
      if (!val && this.hasAnythingChanged) {
        this.$emit('changed')
      }
    }
  },
  methods: {
    show() {
      // 清空患者列表
      this.clearPatientList()
      // 清空患者套餐列表
      this.clearPatientTermList()
      // 重置数据
      this.hasAnythingChanged = false
      // 显示对话框
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
      // 清空选中
      this.clearPatientList()
      this.clearPatientTermList()
      // 同步患者信息
      syncPatient(this.query).then(res => {
        // 关闭弹窗
        loading.close()
        if (res && res.notExists) {
          if (Object.keys(res.notExists).length > 0) {
            let msg = ''
            for (const item in res.notExists) {
              if (res.notExists.hasOwnProperty(item)) {
                if (msg.length > 0) {
                  msg += ','
                }
                msg += '' + item + '=' + res.notExists[item]
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
    // 清空患者列表
    clearPatientList() {
      this.currentPatient = null
      if (this.$refs.patientList) {
        this.$refs.patientList.clearSelection()
        this.$refs.patientList.clear()
      }
    },
    // 患者列表刷新后
    handlePatientAfterRefresh(crud) {
      // 选中第 0 行
      this.$refs.patientList.setCurrentRowByIndex(0)
    },
    // 选中患者改变事件, 刷新患者套餐列表
    handlePatientChange(row) {
      console.log(row)
      this.currentPatient = row
      // 清空患者套餐列表
      this.clearPatientTermList()
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
      this.currentPatientTerm = null
      if (this.$refs.patientTermList) {
        this.$refs.patientTermList.clearSelection()
        this.$refs.patientTermList.clear()
      }
    },
    // 患者列表刷新后
    handlePatientTermAfterRefresh(crud) {
      // 如果设置了 termCode, 则默认选中该 termCode 的患者套餐
      if (this.term && this.term.code) {
        this.$refs.patientTermList.setCurrentRowByTermCode(this.term.code)
      }
    },
    // 选中患者套餐事件, 刷新患者套餐预约列表
    handlePatientTermChange(row) {
      console.log(row)
      this.currentPatientTerm = row
      // 清空预约列表
      this.clearReserveList()
      // 查询预约列表
      this.loadReserveList(row.id)
    },
    // 刷新当前患者套餐
    refreshCurrentPatientTerm() {
      console.log(this.currentPatientTerm)
      if (this.currentPatientTerm && this.currentPatientTerm.id) {
        this.$refs.patientTermList.refreshRowById(this.currentPatientTerm.id)
      }
    },
    // 查询预约列表
    loadReserveList(patientTermId) {
      this.$refs.reserveList.query.deptId = this.dept.id
      this.$refs.reserveList.query.patientTermId = patientTermId
      this.$refs.reserveList.crud.toQuery()
    },
    // 清空预约列表
    clearReserveList() {
      if (this.$refs.reserveList) {
        this.$refs.reserveList.clearSelection()
        this.$refs.reserveList.clear()
      }
    },
    // 新增
    handleAdd() {
      this.$refs.reserveList.preFormData = {
        dept: this.dept,
        patient: this.currentPatient,
        patientTerm: this.currentPatientTerm,
        workTime: this.workTime,
        date: this.date
      }
      this.$refs.reserveList.crud.toAdd()
    },
    // 新增成功后, 刷新剩余次数
    handleReserveAfterSubmit() {
      this.hasAnythingChanged = true
      this.refreshCurrentPatientTerm()
    },
    // 取消成功后, 刷新剩余次数
    handleReserveAfterCancel() {
      this.hasAnythingChanged = true
      this.refreshCurrentPatientTerm()
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
