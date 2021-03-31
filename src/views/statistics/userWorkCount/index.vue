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
    </div>
    <el-table v-loading="loading" :data="tableData">
      <el-table-column label="用户" prop="userName" align="center" />
      <el-table-column label="套餐" prop="termName" align="center" />
      <el-table-column label="日期" prop="date" align="center" />
      <el-table-column label="数量" prop="count" align="center" />
    </el-table>
  </div>
</template>

<script>
import userWorkCountApi from '@/api/statistics/userWorkCount'

import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

import { getDate, formatDate } from '@/utils'

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
      tableData: []
    }
  },
  watch: {},
  created() {
    this.defaultDateRange = [getDate(-120), getDate(-1)]
    this.dateRange = [formatDate(getDate(0)), formatDate(getDate(0))]
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
      userWorkCountApi.getUserWorkCount(this.query).then(res => {
        if (res) {
          const arr = []
          let last = null
          let lastUserId = null
          let lastTermId = null
          let userCount = 0
          let termCount = 0
          for (let i = 0; i < res.length; i++) {
            if (!lastTermId || lastTermId !== res[i].termId) {
              if (last) {
                arr.push({ ...last, termName: '合计', date: '', count: termCount })
              }
              termCount = 0
            }

            if (!lastUserId || lastUserId !== res[i].userId) {
              if (last) {
                arr.push({ ...last, userName: '合计', termName: '', date: '', count: userCount })
              }
              userCount = 0
            }
            termCount += res[i].count
            userCount += res[i].count
            arr.push(res[i])

            last = res[i]
            lastUserId = res[i].userId
            lastTermId = res[i].termId
          }

          if (last) {
            arr.push({ ...last, termName: '合计', date: '', count: termCount })
            arr.push({ ...last, userName: '合计', termName: '', date: '', count: userCount })
          }

          this.tableData = arr
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style>

</style>
