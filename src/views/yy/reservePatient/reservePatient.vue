<template>
  <div class="reservePatient-container">
    <el-row :gutter="10">
      <el-col :span="18">
        <div class="leftPanel">
          <div class="search-container">
            <div class="search-condition-container">
              <!-- 搜索 -->
              <hospital-picker ref="hospitalPicker" :value="currentHospital" @change="handleHospitalChange" />
              <el-select v-model="query.infoType" placeholder="请选择" style="width:100px;">
                <el-option label="电话" value="PHONE" />
                <el-option label="姓名" value="NAME" />
                <el-option label="病案号" value="MRN" />
              </el-select>
              <el-input v-model="query.patientInfo" clearable size="small" placeholder="输入查询条件" style="margin-left:10px; width: 200px;" />
            </div>
            <div class="buttons">
              <el-button type="primary" @click="handleQuery">精准搜索</el-button>
            </div>
          </div>
          <div class="patientList">
            <patient-list ref="patientList" :patient-id="patient.id" />
          </div>
          <div class="reserveTime">
            <reserve-time ref="reserveTime" :dept-id="currentHospital.id" />
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="rightPanel">
          <reserve-list ref="reserveList" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import patientApi from '@/api/yy/patient'

import HospitalPicker from '@/views/yy/hospital/hospitalPicker'
import PatientList from './components/patientList'
import ReserveTime from './components/reserveTime'
import ReserveList from './components/reserveList'

export default {
  name: 'ReservePatient',
  components: { HospitalPicker, PatientList, ReserveTime, ReserveList },
  data: function() {
    return {
      currentHospital: { id: null },
      query: {
        infoType: null,
        patientInfo: ''
      },
      patient: {
        id: null
      },
      loading: null
    }
  },
  methods: {
    // 处理选中医院改变
    handleHospitalChange(val) {
      this.currentHospital = val
      // 刷新资源时间列表
      this.$refs.reserveTime.refresh(val.id, true)
    },
    // 查询数据
    handleQuery() {
      this.openLoading()
      // 同步患者信息
      patientApi.syncPatient(this.query).then(res => {
        this.closeLoading()
        if (res && res.patient) {
          this.patient = res.patient
          // 刷新患者套餐列表
          this.$refs.patientList.refresh(res.patient.id, true)
        }
      }).catch(() => {
        this.closeLoading()
      })
    },
    // 打开加载中
    openLoading() {
      this.closeLoading()
      // 打开加载中
      this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    // 关闭加载中
    closeLoading() {
      if (this.loading) {
        this.loading.close()
        this.loading = null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.reservePatient-container {
  .leftPanel {
    .search-container {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      margin-top: 20px;
      .search-condition-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 20px;
      }
      .buttons {
      }
    }
    .patientList {}
    .reserveTime {}
  }
  .rightPanel {}
}
</style>
<style></style>
