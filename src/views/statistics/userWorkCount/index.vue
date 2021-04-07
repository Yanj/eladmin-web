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
    <el-table v-loading="loading" :data="tableData" :span-method="handleTableSpan" border>
      <el-table-column label="用户" prop="userName" align="center" />
      <el-table-column label="套餐" prop="termName" align="center" />
      <el-table-column label="日期" prop="date" align="center" />
      <el-table-column label="数量" prop="count" align="center" />
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
                arr.push({ ...last, termId: null, termName: '合计', date: '', count: termCount })
              }
              termCount = 0
            }

            if (!lastUserId || lastUserId !== res[i].userId) {
              if (last) {
                arr.push({ ...last, userId: null, userName: '合计', termId: null, termName: '', date: '', count: userCount })
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
            arr.push({ ...last, termId: null, termName: '合计', date: '', count: termCount })
            arr.push({ ...last, userId: null, userName: '合计', termId: null, termName: '', date: '', count: userCount })
          }

          this.tableData = arr
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleTableSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (this.tableData[rowIndex].userId == null) {
          return {
            rowspan: 1,
            colspan: 1
          }
        }
        let rowspan = 0
        let colspan = 0
        if (rowIndex === 0 || (rowIndex > 0 && this.tableData[rowIndex].userId !== this.tableData[rowIndex - 1].userId)) {
          rowspan = 1
          colspan = 1
          for (let i = rowIndex + 1; i < this.tableData.length; i++) {
            if (this.tableData[i].userId === this.tableData[rowIndex].userId) {
              rowspan++
            } else {
              break
            }
          }
        }
        console.log({
          rowspan,
          colspan
        })
        return {
          rowspan,
          colspan
        }
      } else
      if (columnIndex === 1) {
        if (this.tableData[rowIndex].termId == null) {
          return {
            rowspan: 1,
            colspan: 1
          }
        }
        let rowspan = 0
        let colspan = 0
        if (rowIndex === 0 || (rowIndex > 0 && this.tableData[rowIndex].termId !== this.tableData[rowIndex - 1].termId)) {
          rowspan = 1
          colspan = 1
          for (let i = rowIndex + 1; i < this.tableData.length; i++) {
            if (this.tableData[i].termId === this.tableData[rowIndex].termId) {
              rowspan++
            } else {
              break
            }
          }
        }
        // console.log({
        //   rowspan,
        //   colspan
        // })
        return {
          rowspan,
          colspan
        }
      }
    },
    handleDownload() {
      this.downloadLoading = true
      download('api/yy/userWorkCount/download', this.query).then(result => {
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
