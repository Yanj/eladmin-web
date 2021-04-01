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
    </div>
    <el-table v-loading="tableLoading" :data="tableData">
      <el-table-column label="资源组">
        <template slot-scope="scope">
          {{ scope.row.resourceGroup.name }}
        </template>
      </el-table-column>
      <el-table-column v-for="(item, index) in tableColumns" :key="index" :label="item.label" align="center" width="100">
        <template slot-scope="scope">
          <span v-for="(reserve, reserveIndex) in scope.row.list[index].reserves" :key="reserve.id" style="display:block;text-align:left;">{{ reserveIndex !== 0 ? '' : '' }} {{ reserve.patient.name }}({{ verifyStatus_labels[reserve.verifyStatus] }})</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

import workTimeReserveListApi from '@/api/statistics/workTimeReserveList'

import { getDate, formatDate } from '@/utils'

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
      }
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
          this.tableData = res
        }
        this.tableLoading = false
      }).catch(() => {
        this.tableLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
