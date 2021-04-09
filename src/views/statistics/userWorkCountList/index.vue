<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
      <el-date-picker
        v-model="dateRange"
        :clearable="false"
        :picker-options="datePickOptions"
        type="daterange"
        size="small"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        class="filter-item"
        @change="handleDateRangeChange"
      />
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
    </div>
    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="用户" prop="userName" align="center" />
      <el-table-column v-for="column in tableColumns" :key="column.id" :label="column.name" align="center">
        <template slot-scope="scope">
          {{ scope.row[column.id] }}
        </template>
      </el-table-column>
      <el-table-column label="合计" prop="total" align="center" />
    </el-table>
  </div>
</template>

<script>
import userWorkCountApi from '@/api/statistics/userWorkCount'
import { download } from '@/api/data'

import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

import { getMonthDate, getDate, formatDate } from '@/utils'
import { downloadFile } from '@/utils/index'

export default {
  name: 'UserWorkCount',
  components: { deptPicker },
  mixins: [hasAdminPermission()],
  props: {},
  data() {
    return {
      query: {
        orgId: null,
        comId: null,
        deptId: null,
        beginDate: null,
        endDate: null
      },
      defaultDateRange: [0, 0],
      datePickOptions: {
        disabledDate: (date) => {
          return date.getTime() < this.defaultDateRange[0].getTime() || date.getTime() > this.defaultDateRange[1].getTime()
        }
      },
      dateRange: ['', ''],
      loading: false,
      tableColumns: ['套餐'],
      tableData: [],
      downloadLoading: false
    }
  },
  watch: {},
  created() {
    this.defaultDateRange = [getDate(-120), getDate(0)]
    this.dateRange = [formatDate(getMonthDate(0)), formatDate(getMonthDate(-1))]
    this.query.beginDate = this.dateRange[0]
    this.query.endDate = this.dateRange[1]
  },
  methods: {
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.loadData()
    },
    handleDateRangeChange(val) {
      this.query.beginDate = this.dateRange[0]
      this.query.endDate = this.dateRange[1]
      this.loadData()
    },
    handleQuery() {
      this.loadData()
    },
    loadData() {
      this.loading = true
      userWorkCountApi.getUserWorkCountList(this.query).then(res => {
        if (res) {
          this.tableColumns = res.terms
          this.tableData = res.list
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleDownload() {
      this.downloadLoading = true
      download('api/yy/userWorkCount/downloadCountList', this.query).then(result => {
        downloadFile(result, '工作量数据', 'xlsx')
        this.downloadLoading = false
      }).catch(() => {
        this.downloadLoading = false
      })
    }
  }
}
</script>

<style>

</style>
