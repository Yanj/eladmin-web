<template>
  <div class="reservePatient-container">
    <el-row :gutter="10">
      <el-col :span="18">
        <div class="leftPanel">
          <div class="search-container">
            <div class="search-condition-container">
              <!-- 搜索 -->
              <hospital-picker ref="hospitalPicker" :value="currentHospital" @change="handleHospitalChange" />
              <el-select v-model="query.infoType" placeholder="请选择" style="width:100px;margin-left:10px;">
                <el-option label="电话" value="PHONE" />
                <el-option label="姓名" value="NAME" />
                <el-option label="病案号" value="MRN" />
              </el-select>
              <el-input v-model="query.patientInfo" clearable size="small" placeholder="输入查询条件" style="margin-left:10px; width: 200px;" />
            </div>
            <div class="buttons">
              <el-button type="primary" @click="handleQuery">本地搜索</el-button>
              <el-button type="primary" @click="handleQueryHis">HIS搜索</el-button>
            </div>
          </div>
          <div class="patientTermList">
            <patient-term-list ref="patientTermList" :patient-id="patient.id" @change="handlePatientTermChange" />
          </div>
          <div class="reserveTime">
            <reserve-time ref="reserveTime" :dept-id="currentHospital.id" :term="term" @on-item-click="handleReserveTimeItemClick" />
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="rightPanel">
          <div class="buttons">
            <el-button
              :disabled="reserveList.length === 0"
              :loading="reserveSavingLoading"
              icon="el-icon-check"
              type="primary"
              @click="saveReserveList"
            >保存</el-button>
          </div>
          <div class="reserveList">
            <reserve-list ref="reserveList" :reserve-list="reserveList" @clear="handleReserveClear" @item-click="handleReserveItemClick" />
          </div>
          <div class="recentReserveList">
            <recent-reserve-list ref="recentReserveList" :patient-term="patientTerm" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import patientApi from '@/api/yy/patient'
import reserveApi from '@/api/yy/reserve'
import { getAllTerms } from '@/api/yy/term'

import HospitalPicker from '@/views/yy/hospital/hospitalPicker'
import PatientTermList from './components/patientTermList'
import ReserveTime from './components/reserveTime'
import ReserveList from './components/reserveList'
import RecentReserveList from './components/recentReserveList'

export default {
  name: 'ReservePatient',
  components: { HospitalPicker, PatientTermList, ReserveTime, ReserveList, RecentReserveList },
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
      patientTerm: null,
      term: null,
      reserveList: [],
      loading: null,
      reserveSavingLoading: false
    }
  },
  methods: {
    // 处理选中医院改变
    handleHospitalChange(val) {
      this.currentHospital = val
      // 刷新资源时间列表
      this.$refs.reserveTime.refresh(val.id, true)
      // 重置相关信息
      this.resetAll()
    },
    // 查询数据
    handleQuery() {
      this.openLoading()
      // 重置相关信息
      this.resetAll()
      // 同步患者信息
      patientApi.queryPatient(this.query).then(res => {
        this.closeLoading()
        if (res && Array.isArray(res) && res.length > 0) {
          this.patient = res[0]
          // 刷新患者套餐列表
          this.$refs.patientTermList.refresh(res.patient.id, true)
        }
      }).catch(() => {
        this.closeLoading()
      })
    },
    handleQueryHis() {
      this.openLoading()
      // 重置相关信息
      this.resetAll()
      // 同步患者信息
      patientApi.syncPatient(this.query).then(res => {
        this.closeLoading()
        if (res && res.patient) {
          this.patient = res.patient
          // 刷新患者套餐列表
          this.$refs.patientTermList.refresh(res.patient.id, true)
        }
      }).catch(() => {
        this.closeLoading()
      })
    },
    resetAll() {
      this.patient = { id: null }
      this.patientTerm = null
      this.term = null
      this.reserveList = []
      this.$refs.reserveTime.reset()
    },
    reload() {
      this.patient = { id: null }
      this.patientTerm = null
      this.term = null
      this.reserveList = []
      this.$refs.reserveTime.loadReserveCountList()
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
    },
    // 处理患者套餐改变
    handlePatientTermChange(patientTerm) {
      this.patientTerm = patientTerm
      // 加载套餐
      getAllTerms({ deptId: this.currentHospital.id, code: patientTerm.termCode }).then(res => {
        console.log(res)
        if (res) {
          this.term = res[0]
        }
      })
    },
    // 时间选择
    handleReserveTimeItemClick(obj) {
      if (this.patientTerm) {
        obj = { ...obj, patientTerm: this.patientTerm }
        // 查找已预约列表
        let reserveIndex = -1
        for (let i = 0; i < this.reserveList.length; i++) {
          if (this.equalsReserve(this.reserveList[i], obj)) {
            reserveIndex = i
            break
          }
        }
        if (reserveIndex === -1) {
          // 判断同一套餐在同时段是否已预约了其它资源组
          let anotherIndex = -1
          for (let i = 0; i < this.reserveList.length; i++) {
            if (this.equalsReserveIgnoreResourceGroup(this.reserveList[i], obj)) {
              anotherIndex = i
              break
            }
          }
          if (anotherIndex !== -1) {
            // 移除该资源组
            this.$refs.reserveTime.changeResourceCount(this.reserveList[anotherIndex], 1)
            this.reserveList.splice(anotherIndex, 1)
          }
          // 判断用户套餐是否次数足够
          if (this.reserveList.length >= this.patientTerm.times) {
            this.$message('该套餐次数已耗尽')
            return
          }
          // 新增
          this.$refs.reserveTime.changeResourceCount(obj, -1)
          this.reserveList.push({ dept: this.currentHospital, patientTerm: this.patientTerm, date: obj.date, workTime: obj.workTime, resourceGroup: obj.resourceGroup })
        } else {
          this.$refs.reserveTime.changeResourceCount(obj, 1)
          this.reserveList.splice(reserveIndex, 1)
        }
      }
    },
    // 预约清空
    handleReserveClear() {
      this.reserveList = []
      this.$refs.reserveTime.reset()
    },
    // 预约项目点击
    handleReserveItemClick({ item, index }) {
      // 移除预约
      this.removeReserves([item])
    },
    // 移除预约
    removeReserves(arr) {
      for (let i = 0; i < arr.length; i++) {
        this.$refs.reserveTime.changeResourceCount(arr[i], 1)
        let index = -1
        for (let j = 0; j < this.reserveList.length; j++) {
          if (this.equalsReserve(this.reserveList[j], arr[i])) {
            index = j
            break
          }
        }
        if (index !== -1) {
          this.reserveList.splice(arr[i], 1)
        }
      }
    },
    // 对比预约是否是同一个
    equalsReserve(obj1, obj2) {
      return obj1.patientTerm.id === obj2.patientTerm.id && obj1.date === obj2.date && obj1.workTime.id === obj2.workTime.id && obj1.resourceGroup.id === obj2.resourceGroup.id
    },
    equalsReserveIgnoreResourceGroup(obj1, obj2) {
      return obj1.patientTerm.id === obj2.patientTerm.id && obj1.date === obj2.date && obj1.workTime.id === obj2.workTime.id
    },
    // 保存预约列表
    saveReserveList() {
      this.reserveSavingLoading = true
      console.log(this.reserveList)
      reserveApi.addList(this.reserveList).then(res => {
        this.$message('预约成功')
        // 重新加载
        this.reload()
      }).finally(() => {
        this.reserveSavingLoading = false
      })
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
        .el-button {
          margin-right: 10px;
        }
      }
    }
    .patientTermList {
      margin-top: 10px;
    }
    .reserveTime {
      margin-top: 10px;
    }
  }
  .rightPanel {
    width: 100%;
    .buttons {
      width: 100%;
      margin-top: 20px;
      padding: 10px 20px;
      box-sizing: border-box;
      display: flex;
      flex-direction: row-reverse;
    }
    .reserveList {
    }
    .recentReserveList {
      margin-top: 10px;
    }
  }
}
</style>
<style></style>
