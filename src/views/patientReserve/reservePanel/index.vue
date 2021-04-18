<template>
  <div class="reservePatient-container">
    <el-row :gutter="10">
      <el-col :span="18">
        <div class="leftPanel">
          <div class="search-container">
            <div class="search-condition-container">
              <!-- 搜索 -->
              <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
              <el-select v-model="patientSource" placeholder="请选择" style="width:100px;margin-left:10px;" @change="handlePatientHisQueryTypeChange">
                <el-option v-for="item in patientSources" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <template v-if="isPatientFromHis">
                <el-select v-model="patientHisQueryType" placeholder="请选择" style="width:100px;margin-left:10px;">
                  <el-option v-for="item in patientHisQueryTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input v-model="patientHisQueryInfo" clearable size="small" placeholder="输入查询条件" style="margin-left:10px; width: 200px;" />
              </template>
            </div>
            <div class="buttons">
              <el-button v-if="isPatientFromHis" type="primary" @click="handleQuery">本地搜索</el-button>
              <el-button v-if="isPatientFromHis" type="primary" @click="handleQueryHis">HIS搜索</el-button>
              <el-button v-if="!isPatientFromHis" @click="handleClear">清空</el-button>
            </div>
          </div>
          <div class="patientInfo">
            <div class="panel-title">患者信息</div>
            <div class="panel-content">
              <div class="patient-info-item">
                <label>患者信息:</label>
                <el-input v-model="patient.name" size="small" :disabled="isPatientFromHis" />
              </div>
              <div class="patient-info-item">
                <label>联系电话:</label>
                <el-input v-model="patient.phone" size="small" :disabled="isPatientFromHis" />
              </div>
            </div>
          </div>
          <div v-show="isPatientFromHis" class="patientTermList">
            <patient-term-list ref="patientTermList" :patient-id="patient.id" @change="handlePatientTermChange" />
          </div>
          <div v-show="!isPatientFromHis" class="patientTermList">
            <term-list ref="termList" :com-id="currentDept.comId" @change="handleTermChange" />
          </div>
          <div class="reserveTime">
            <reserve-time ref="reserveTime" :com-id="currentDept.comId" :term="term" @on-item-click="handleReserveTimeItemClick" />
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
import patientApi from '@/api/patientReserve/patient'
import reserveApi from '@/api/patientReserve/reserve'
import { getAllTerms } from '@/api/patientReserve/term'

import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

import TermList from './components/termList'
import PatientTermList from './components/patientTermList'
import ReserveTime from './components/reserveTime'
import ReserveList from './components/reserveList'
import RecentReserveList from './components/recentReserveList'

export default {
  name: 'ReservePanel',
  components: { deptPicker, TermList, PatientTermList, ReserveTime, ReserveList, RecentReserveList },
  mixins: [hasAdminPermission()],
  data: function() {
    return {
      patientSources: [
        { label: 'HIS', value: 0 },
        { label: '美团', value: 1 }
      ],
      patientSource: 0,
      patientHisQueryTypes: [
        { label: '电话', value: 0 },
        { label: '姓名', value: 1 },
        { label: '病案号', value: 2 }
      ],
      patientHisQueryType: 0,
      patientHisQueryInfo: null,
      query: {
        orgId: null,
        comId: null,
        deptId: null,
        phone: null,
        name: null,
        mrn: null
      },
      patient: {
        id: null,
        name: null,
        phone: null
      },
      patientTerm: null,
      term: null,
      reserveList: [],
      loading: null,
      reserveSavingLoading: false,
      currentDept: {
        orgId: null,
        comId: null,
        deptId: null
      }
    }
  },
  computed: {
    isPatientFromHis: function() {
      return this.patientSource === 0
    }
  },
  methods: {
    // 部门改变
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.currentDept = dept

      // 刷新资源时间列表
      this.$refs.reserveTime.refresh(dept.comId, true)
      // 重置相关信息
      this.resetAll()
    },
    // 患者查询类型改变
    handlePatientHisQueryTypeChange() {
      // 重置相关信息
      this.resetAll()
      // 如果不是从 HIS 查询, 则刷新套餐列表
      if (!this.isPatientFromHis) {
        this.$refs.termList.refresh(this.query.comId, true)
      }
    },
    // 根据用户选择重新构建 query
    rebuildQuery() {
      console.log(this.patientHisQueryType)
      console.log(this.patientHisQueryInfo)
      if (this.patientHisQueryType === 0 || this.patientHisQueryType === '0') {
        this.query.mrn = null
        this.query.name = null
        this.query.phone = this.patientHisQueryInfo
      } else if (this.patientHisQueryType === 1 || this.patientHisQueryType === '1') {
        this.query.mrn = null
        this.query.name = this.patientHisQueryInfo
        this.query.phone = null
      } else if (this.patientHisQueryType === 2 || this.patientHisQueryType === '2') {
        this.query.mrn = this.patientHisQueryInfo
        this.query.name = null
        this.query.phone = null
      } else {
        return
      }
      console.log(this.query)
    },
    // 查询数据
    handleQuery() {
      // 打开加载对话框
      this.openLoading()
      // 构建请求体
      this.rebuildQuery()
      // 重置相关信息
      this.resetAll()
      // 同步患者信息
      patientApi.getAllPatients(this.query).then(res => {
        this.closeLoading()
        const arr = res.content
        if (arr && Array.isArray(arr) && arr.length > 0) {
          this.patient = arr[0]
          // 刷新患者套餐列表
          this.$refs.patientTermList.refresh(this.patient.id, true)
        }
      }).catch(() => {
        this.closeLoading()
      })
    },
    handleQueryHis() {
      // 打开加载对话框
      this.openLoading()
      // 构建请求体
      this.rebuildQuery()
      // 重置相关信息
      this.resetAll()
      // 同步患者信息
      patientApi.syncPatient(this.query).then(res => {
        this.closeLoading()
        if (res) {
          this.patient = res
          // 刷新患者套餐列表
          this.$refs.patientTermList.refresh(this.patient.id, true)
        }
      }).catch(() => {
        this.closeLoading()
      })
    },
    handleClear() {
      this.resetAll()
      this.$refs.termList.reset()
    },
    resetAll() {
      this.patient = { id: null, name: null, phone: null }
      this.patientTerm = null
      this.term = null
      this.reserveList = []
      this.$refs.reserveTime.reset()
    },
    reload() {
      this.patient = { id: null, name: null, phone: null }
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
      getAllTerms({ comId: this.query.comId, code: patientTerm.termCode }).then(res => {
        console.log(res)
        if (res) {
          this.term = res.content[0]
        }
      })
    },
    handleTermChange(term) {
      console.log(term)
      if (!this.isPatientFromHis) {
        this.patientTerm = null
        this.term = term
      }
    },
    // 时间选择
    handleReserveTimeItemClick(obj) {
      if (this.patientTerm) {
        obj = { ...obj, patientTerm: this.patientTerm }
      } else if (this.term) {
        obj = { ...obj, term: this.term }
      } else {
        return
      }
      console.log('handleReserveTimeItemClick')
      console.log(obj)
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
        if (this.patientTerm && this.getReserveCountById(this.patientTerm.id) >= this.patientTerm.times) {
          this.$message('该套餐次数已耗尽')
          return
        } else if (this.term && this.getReserveCountById(this.term.id) >= 1) {
          this.$message('该套餐次数已耗尽')
          return
        }
        // 新增
        this.$refs.reserveTime.changeResourceCount(obj, -1)
        if (this.patientTerm) {
          this.reserveList.push({ ...this.currentDept, patientTerm: this.patientTerm, date: obj.date, workTime: obj.workTime, resourceGroup: obj.resourceGroup })
        } else if (this.term) {
          this.reserveList.push({ ...this.currentDept, patient: this.patient, term: this.term, date: obj.date, workTime: obj.workTime, resourceGroup: obj.resourceGroup })
        }
      } else {
        this.$refs.reserveTime.changeResourceCount(obj, 1)
        this.reserveList.splice(reserveIndex, 1)
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
    // 获取已预约的数量
    getReserveCountById(id) {
      let count = 0
      for (let i = 0; i < this.reserveList.length; i++) {
        const item = this.reserveList[i]
        if (item.patientTerm && item.patientTerm.id === id) {
          count++
        } else if (item.term && item.term.id === id) {
          count++
        }
      }
      return count
    },
    // 对比预约是否是同一个
    equalsReserve(obj1, obj2) {
      if (obj1.patientTerm && obj2.patientTerm) {
        return obj1.patientTerm.id === obj2.patientTerm.id && obj1.date === obj2.date && obj1.workTime.id === obj2.workTime.id && obj1.resourceGroup.id === obj2.resourceGroup.id
      } else if (obj1.term && obj2.term) {
        return obj1.term.id === obj2.term.id && obj1.date === obj2.date && obj1.workTime.id === obj2.workTime.id && obj1.resourceGroup.id === obj2.resourceGroup.id
      } else {
        return false
      }
    },
    equalsReserveIgnoreResourceGroup(obj1, obj2) {
      if (obj1.patientTerm && obj2.patientTerm) {
        return obj1.patientTerm.id === obj2.patientTerm.id && obj1.date === obj2.date && obj1.workTime.id === obj2.workTime.id
      } else if (obj1.term && obj2.term) {
        return obj1.term.id === obj2.term.id && obj1.date === obj2.date && obj1.workTime.id === obj2.workTime.id
      } else {
        return false
      }
    },
    // 保存预约列表
    saveReserveList() {
      if (this.reserveList.length === 0) {
        return
      }
      if (!this.isPatientFromHis) {
        if (!this.patient) {
          this.$message('请输入患者信息')
          return
        }
        if (!this.patient.name) {
          this.$message('请输入患者姓名')
          return
        }
        if (!this.patient.phone) {
          this.$message('请输入患者电话')
          return
        }
        // 将所有患者信息更新成最新的
        for (let i = 0; i < this.reserveList.length; i++) {
          this.reserveList[i].patient.name = this.patient.name
          this.reserveList[i].patient.phone = this.patient.phone
        }
      }
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
    .patientInfo {
      .panel-title {
        width: 100%;
        padding: 8px 10px;
        line-height: 23px;
        color: #909399;
        font-size: 12px;
      }
      .panel-content {
        border: 1px solid #DDDDDD;
        border-width: 1px 0;
        padding: 10px 10px;
        box-sizing: border-box;
        display: flex;
        .patient-info-item {
          flex: 1;
          display: flex;
          align-items: center;
          label {
            font-size: 13px;
            font-weight: normal;
            width: 20%;
            text-align: right;
            padding-right: 10px;
            box-sizing: border-box;
          }
          .el-input {
            width: 80%;
          }
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
