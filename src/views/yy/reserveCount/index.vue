<template>
  <div class="app-container">
    <div class="head-container">
      <!--选择医院-->
      <hospital-picker :value="currentHospital" @change="handleHospitalChange" />
      <!--选择日期-->
      <el-date-picker v-model="query.date" :clearable="false" type="date" size="small" value-format="yyyy-MM-dd" class="filter-item" placeholder="选择日期" @change="handleDateChange" />
      <!--选择套餐-->
      <el-select v-show="false" v-model="query.termId" size="small" clearable placeholder="请选择套餐" class="filter-item" @change="handleTermChange">
        <el-option v-for="term in terms" :key="term.id" :label="term.name" :value="term.id" />
      </el-select>
      <span>
        <el-button v-show="false" type="primary" size="small" class="filter-item" style="margin-left: 20px" @click="loadData">搜索</el-button>
        <el-button size="small" class="filter-item" style="margin-left: 20px" @click="clearQuery">重置</el-button>
        <el-button v-show="false" v-permission="permission.add" type="primary" size="small" class="filter-item" style="margin-left: 10px" @click="handleAdd">新增预约</el-button>
      </span>
    </div>
    <el-card class="box-card">
      <el-tooltip class="item" effect="dark" content="选择指定患者查看患者套餐列表" placement="top">
        <span class="role-span">预约看板</span>
      </el-tooltip>
      <el-table ref="table" v-loading="tableLoading" :data="tableData" max-height="600" highlight-current-row @row-click="handleRowClick">
        <el-table-column label="时段" width="100">
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
            <el-link type="primary" :class="scope.row.terms[term.id+''] ? '':'num-zero'" @click.stop="handleTermItemClick(term.code, scope.row.workTime)">{{ scope.row.terms[term.id+''] || '0' }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="box-card" style="margin-top: 20px">
      <el-tooltip class="item" effect="dark" content="预约列表" placement="top">
        <span class="role-span">预约列表</span>
      </el-tooltip>
      <reserve ref="reserveList" :show-header="false" />
    </el-card>
    <QueryPatient ref="queryPatient" @changed="handlePatientReserveChanged" />
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
      originalWorkTimes: [],
      workTimes: [],
      originalTerms: [],
      terms: [],
      tableData: [],
      tableCurrentRow: null,
      tableLoading: false,
      permission: {
        add: ['admin', 'reserveCount:add']
      },
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
    clearQuery() {
      // this.$refs['table'].setCurrentRow()
      this.handleRowClick(null)
    },
    loadData(refreshTableHeader) {
      this.tableLoading = true
      getReserveCount(this.query).then(res => {
        this.tableLoading = false
        if (res) {
          if (refreshTableHeader) {
            this.originalWorkTimes = res.workTimes
            this.workTimes = res.workTimes
            this.originalTerms = res.terms
            this.terms = res.terms
          }
          this.tableData = res.items
        }
      }).catch(() => {
        this.tableLoading = false
      })
    },
    // 选中时段改变事件, 更新预约列
    handleRowClick(row, column, event) {
      if (this.tableCurrentRow === row) {
        this.tableCurrentRow = null
      } else {
        this.tableCurrentRow = row
      }
      this.$refs['table'].setCurrentRow(this.tableCurrentRow)

      if (this.tableCurrentRow) {
        this.$refs['reserveList'].query.workTimeId = this.tableCurrentRow.workTime.id
      } else {
        this.$refs['reserveList'].query.workTimeId = null
      }
      this.$refs['reserveList'].crud.toQuery()
    },
    // 选择医院改变, 刷新数据
    handleHospitalChange(val) {
      this.currentHospital = val
      this.query.deptId = val.id
      // 刷新数据
      this.loadData(true)

      this.$refs['reserveList'].query.deptId = val.id
      this.$refs['reserveList'].query.date = this.query.date
      this.$refs['reserveList'].crud.toQuery()
    },
    // 选择日期改变, 刷新数据
    handleDateChange(val) {
      // 刷新数据
      this.loadData()
      // 刷新预约列表
      this.$refs['reserveList'].query.date = val
      this.$refs['reserveList'].crud.toQuery()
    },
    // 选择套餐改变, 刷新数据
    handleTermChange(val) {
      // 刷新预约列表
      if (val) {
        // 查找选中的套餐
        let term = null
        for (let i = 0; i < this.terms.length; i++) {
          if (this.terms[i].id === val) {
            term = this.terms[i]
            break
          }
        }
        // 更新套餐列表为选中的套餐
        if (term != null) {
          this.terms = [term]
        }
        // 更新预约列表的查询条件
        this.$refs['reserveList'].query.termId = val
      } else {
        // 更新套餐列表为全部的套餐
        this.terms = this.originalTerms
        // 更新预约列表的查询条件
        this.$refs['reserveList'].query.termId = null
      }
      this.workTimes = this.originalWorkTimes
      // 刷新表格
      this.$refs.table.doLayout()
      // 刷新预约列表
      this.$refs['reserveList'].crud.toQuery()
    },
    // 某时段的套餐点击, 打开新增预约
    handleTermItemClick(termCode, workTime) {
      // console.log(termCode)
      // console.log(workTime)
      // const term = { code: termCode }
      // this.openReserve(workTime, term)
    },
    // 处理新增预约事件
    handleAdd() {
      this.openReserve(null, null)
    },
    // 打开新增预约对话框
    openReserve(workTime, term) {
      this.$refs['queryPatient'].dept = this.currentHospital
      this.$refs['queryPatient'].workTime = workTime
      this.$refs['queryPatient'].date = this.query.date
      this.$refs['queryPatient'].term = term
      this.$refs['queryPatient'].show()
    },
    // 预约发生改变
    handlePatientReserveChanged() {
      // 刷新数据
      this.loadData()
      // 刷新预约列表
      this.$refs['reserveList'].crud.toQuery()
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
