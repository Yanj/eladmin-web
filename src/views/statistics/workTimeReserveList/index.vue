<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
      <el-date-picker
        v-model="query.date"
        :clearable="false"
        :picker-options="datePickOptions"
        type="date"
        size="small"
        placeholder="选择日期"
        value-format="yyyy-MM-dd"
        class="filter-item"
        @change="handleDateChange"
      />
      <el-select
        v-model="query.verifyStatus"
        :clearable="false"
        placeholder="预约状态"
        size="small"
        class="filter-item"
        @change="handleVerifyStatusChange"
      >
        <el-option v-for="item in verifyStatus" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button
        class="filter-item"
        size="small"
        type="primary"
        @click="handleQuery"
      >查询</el-button>
      <el-button
        :loading="downloadLoading"
        :disabled="!tableData.length"
        class="filter-item"
        size="small"
        type="warning"
        @click="handleDownload"
      >导出</el-button>
      <el-button
        class="filter-item"
        size="small"
        @click="handlePrint"
      >打印</el-button>
    </div>
    <div id="printWrapper">
      <el-table v-loading="tableLoading" :data="tableData" border>
        <el-table-column label="资源组" align="center" width="150">
          <template slot-scope="scope">
            {{ scope.row.resourceGroup.name }}
          </template>
        </el-table-column>
        <el-table-column v-for="(item, index) in tableColumns" :key="index" :label="item.label" align="center" :width="showStatus ? 100 : 60">
          <template slot-scope="scope">
            <span v-for="(reserve, reserveIndex) in scope.row.list[index].reserves" :key="reserve.id" style="display: block;text-align: left;padding-left: 5px;">
              {{ reserveIndex !== 0 ? '' : '' }}
              {{ reserve.patient.name }}
              <i v-if="showStatus">({{ verifyStatus_labels[reserve.verifyStatus] }})</i>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>

import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

import workTimeReserveListApi from '@/api/statistics/workTimeReserveList'
import { download } from '@/api/data'

import { getDate, formatDate } from '@/utils'
import { downloadFile } from '@/utils/index'

export default {
  name: 'WorkTimeReserveList',
  components: { deptPicker },
  mixins: [hasAdminPermission()],
  data() {
    return {
      datePickOptions: {
        disabledDate: (date) => {
          return date.getTime() > Date.now()
        }
      },
      query: {
        orgId: null,
        comId: null,
        deptId: null,
        date: null,
        verifyStatus: ''
      },
      tableLoading: false,
      tableColumns: [],
      tableData: [],
      verifyStatus: [
        { label: '全部', value: '' },
        { label: '已预约', value: 'init' },
        { label: '已签到', value: 'check_in' },
        { label: '已核销', value: 'verified' },
        { label: '已取消', value: 'canceled' }
      ],
      verifyStatus_labels: {
        'init': '已预约',
        'check_in': '已签到',
        'verified': '已核销',
        'canceled': '已取消'
      },
      showStatus: true,
      downloadLoading: false
    }
  },
  created() {
    this.query.date = formatDate(getDate(0))
    this.loadWorkTimes()
  },
  methods: {
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.loadWorkTimes()
    },
    handleDateChange(val) {
      this.loadData()
    },
    handleVerifyStatusChange(val) {
      this.loadData()
    },
    handleQuery() {
      this.loadWorkTimes()
    },
    loadWorkTimes() {
      if (!this.query.comId && this.hasAdminPermission) {
        return
      }
      this.tableLoading = true
      workTimeReserveListApi.getWorkTimeList(this.query).then(res => {
        if (res) {
          const arr = []
          for (let i = 0; i < res.length; i++) {
            arr.push({ label: res[i].beginTime })
          }
          this.tableColumns = arr
          this.loadData()
        }
      }).catch(() => {
        this.tableLoading = false
      })
    },
    loadData() {
      this.tableLoading = true
      workTimeReserveListApi.getWorkTimeReserveList(this.query).then(res => {
        if (res) {
          this.showStatus = !this.query.verifyStatus
          this.tableData = res
        }
        this.tableLoading = false
      }).catch(() => {
        this.tableLoading = false
      })
    },
    handleDownload() {
      this.downloadLoading = true
      download('api/yy/workTimeReserveList/download', this.query).then(result => {
        downloadFile(result, this.query.date + '数据', 'xlsx')
        this.downloadLoading = false
      }).catch(() => {
        this.downloadLoading = false
      })
    },
    handlePrint() {
      const subOutputRankPrint = document.getElementById('printWrapper')
      // console.log(subOutputRankPrint.innerHTML)
      const newContent = subOutputRankPrint.innerHTML
      const oldContent = document.body.innerHTML
      document.body.innerHTML = newContent
      window.print()
      window.location.reload()
      document.body.innerHTML = oldContent
      return false
    }
  }
}
</script>

<style>
#printWrapper .el-table .cell {
  padding: 0;
}
</style>
