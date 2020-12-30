<template>
  <div class="app-container">
    <div class="head-container">
      <hospital-picker :value="currentHospital" @change="handleHospitalChange" />
      <el-date-picker v-model="query.date" type="date" size="small" value-format="yyyy-MM-dd" class="filter-item" placeholder="选择日期" @change="handleDateChange" />
      <el-select v-model="query.termId" size="small" clearable placeholder="请选择套餐" class="filter-item" @change="handleTermChange">
        <el-option v-for="term in terms" :key="term.id" :label="term.name" :value="term.id" />
      </el-select>
      <span>
        <el-button type="primary" size="small" class="filter-item" @click="loadData">搜索</el-button>
      </span>
    </div>
    <el-table :data="tableData" max-height="300" highlight-current-row @current-change="handleTableCurrentChange">
      <el-table-column label="时段" width="100" fixed>
        <template slot-scope="scope">
          <div style="display: flex; flex-direction: row; justify-content: start; align-items: start;">
            <div>{{ scope.row.workTime.beginTime }}</div>
            -
            <div>{{ scope.row.workTime.endTime }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-for="term in terms" :key="term.id" :label="term.name" align="center" width="150">
        <template slot-scope="scope">
          <el-link type="primary" :class="scope.row.terms[term.id+''] ? '':'num-zero'" @click.stop="handleTermItemClick(term.id, scope.row.workTime)">{{ scope.row.terms[term.id+''] || '0' }}</el-link>
        </template>
      </el-table-column>
    </el-table>
    <div>
      <reserve ref="reserveList" :show-header="false" />
    </div>
    <QueryPatient ref="queryPatient" />
  </div>
</template>

<script>
import HospitalPicker from '@/views/yy/hospital/hospitalPicker'
import Reserve from '@/views/yy/reserve/index'
import QueryPatient from '@/views/yy/reserveCount/queryPatient'
import { getReserveCount } from '@/api/yy/reserve'
import { parseTime } from '@/utils'

export default {
  name: 'ReserveCount',
  components: { HospitalPicker, Reserve, QueryPatient },
  data: function() {
    return {
      workTimes: [],
      terms: [],
      tableData: [],
      currentHospital: null,
      query: {
        deptId: null,
        date: null,
        termId: null,
        resourceGroupId: null
      }
    }
  },
  created() {
    this.getCurrentDate()
  },
  methods: {
    getCurrentDate() {
      this.query.date = parseTime(new Date().getTime(), '{y}-{m}-{d}')
    },
    loadData() {
      getReserveCount(this.query).then(res => {
        if (res) {
          this.workTimes = res.workTimes
          this.terms = res.terms
          this.tableData = res.items
        }
      })
    },
    handleTableCurrentChange(row) {
      console.log(row)
      if (row) {
        this.$refs['reserveList'].query.workTimeId = row.workTime.id
      } else {
        this.$refs['reserveList'].query.workTimeId = null
      }
      this.$refs['reserveList'].crud.toQuery()
    },
    handleHospitalChange(val) {
      this.currentHospital = val
      this.query.deptId = val.id
      this.loadData()

      this.$refs['reserveList'].query.deptId = val.id
      this.$refs['reserveList'].query.date = this.query.date
      this.$refs['reserveList'].crud.toQuery()
    },
    handleDateChange(val) {
      this.$refs['reserveList'].query.date = val
      this.$refs['reserveList'].crud.toQuery()
    },
    handleTermChange(val) {
      console.log(val)
      if (val) {
        this.$refs['reserveList'].query.termId = val
      } else {
        this.$refs['reserveList'].query.termId = null
      }
      this.$refs['reserveList'].crud.toQuery()
    },
    handleTermItemClick(termId, workTime) {
      console.log(termId)
      console.log(workTime)
      this.$refs['queryPatient'].dept = this.currentHospital
      this.$refs['queryPatient'].workTime = workTime
      this.$refs['queryPatient'].date = this.query.date
      this.$refs['queryPatient'].term = { id: termId }
      this.$refs['queryPatient'].show()
    }
  }
}
</script>

<style>
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.app-top-container,.app-bottom-container {
  flex: 1;
  width: 100%;
  overflow: scroll;
}
.el-link.el-link--primary.num-zero {
  color: #666666;
}
</style>
