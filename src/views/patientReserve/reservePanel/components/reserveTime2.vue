<template>
  <div class="reserve-time-wrapper">
    <div class="filter-container" style="margin-bottom: 10px;">
      <label>日期: </label>
      <el-date-picker
        v-model="dateRange"
        :clearable="false"
        :picker-options="datePickOptions"
        type="daterange"
        size="mini"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        style="width:300px"
        @change="handleDateRangeChange"
      />
      <label>时间段: </label>
      <el-time-select
        v-model="startTime"
        size="mini"
        placeholder="起始时间"
        :picker-options="startTimePickOptions"
        style="width:120px"
        @change="handleStartTimeChange"
      />
      <el-time-select
        v-model="endTime"
        size="mini"
        placeholder="结束时间"
        :picker-options="endTimePickOptions"
        style="width:120px"
        @change="handleEndTimeChange"
      />
      <el-button type="primary" size="mini" style="margin-left: 10px" @click="handleFilter">过滤</el-button>
      <el-button size="mini" style="margin-left: 10px" @click="handleClear">清空</el-button>
    </div>
    <el-table v-loading="loading" :data="tableData" :cell-class-name="tableCellClassMethod">
      <el-table-column label="资源组" align="center">
        <template slot-scope="scope">
          <div>
            {{ scope.row.resourceGroup.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column v-for="(columnData, index) in tableColumnData" :key="index" :label="getWorkTimeLabel(columnData.date, columnData.workTime)" align="center">
        <template slot-scope="scope">
          <div style="background: #00000000;width:100%;height:100%;padding: 8px 12px;" @click.stop="handleResourceClick({resourceGroup: scope.row.resourceGroup, date: scope.row.list[index].date, workTime: scope.row.list[index].workTime, index: scope.$index, columnIndex: index}, scope.row, scope.$index, index)">
            <label :class="scope.row.list[index].used !== originalTableData[scope.$index].list[index].used ? 'resourceGroup-count-changed': ''">{{ scope.row.list[index].used }}</label>
            <label>/</label>
            <label :class="scope.row.list[index].left === 0 ? 'resourceGroup-disabled':''">{{ scope.row.list[index].count }}</label>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getReserveCountList2 } from '@/api/patientReserve/reserve'
import workTimeApi from '@/api/patientReserve/workTime'

import { cloneDeep } from 'lodash/lang'
import { getDate, formatDate, parseTime } from '@/utils'

export default {
  name: 'ReservePanelReserveTime',
  components: {},
  props: {
    comId: {
      type: [Number, String],
      default: null
    },
    term: {
      type: Object,
      default: null
    }
  },
  data: function() {
    const comId = this.comId
    return {
      query: {
        comId: comId,
        beginDate: null,
        endDate: null,
        beginTime: null,
        endTime: null
      },
      tableColumnData: [],
      originalTableColumnData: [],
      tableData: [],
      originalTableData: [],
      loading: false,
      defaultDateRange: [0, 0],
      datePickOptions: {
        disabledDate: (date) => {
          return date.getTime() < this.defaultDateRange[0].getTime() || date.getTime() > this.defaultDateRange[1].getTime()
        }
      },
      startTimePickOptions: {
        start: '09:00',
        step: '00:30',
        end: '18:00',
        maxTime: this.endTime
      },
      endTimePickOptions: {
        start: '09:00',
        step: '00:30',
        end: '18:00',
        minTime: this.startTime
      },
      currentResourceGroups: [],
      dateRange: ['', ''],
      defaultTimeRange: ['09:00', '18:00'],
      startTime: '',
      endTime: ''
    }
  },
  watch: {
    comId: function(val) {
      this.refresh(val)
    },
    term: function(val) {
      console.log(val)
      if (val) {
        this.currentResourceGroups = val.resourceGroups || []
      } else {
        this.currentResourceGroups = []
      }
    }
  },
  created() {
    // 可选择范围, 最近 2 周内
    this.defaultDateRange = [getDate(0), getDate(13)]
    // 默认范围, 今天内
    this.dateRange = [formatDate(getDate(0)), formatDate(getDate(0))]
    this.query.comId = this.comId
    this.query.beginDate = this.dateRange[0]
    this.query.endDate = this.dateRange[1]
  },
  mounted() {
    this.loadReserveCountList()
    this.loadAllWorkTimes()
  },
  methods: {
    // 加载所有工作时间
    loadAllWorkTimes() {
      workTimeApi.getAllWorkTime({ comId: this.query.comId }).then(res => {
        if (res) {
          const arr = res.content
          this.defaultTimeRange = arr
          this.startTimePickOptions.start = arr[0].beginTime || '09:00'
          this.startTimePickOptions.end = arr[arr.length - 1].endTime || '18:00'
          this.endTimePickOptions.start = arr[0].beginTime || '09:00'
          this.endTimePickOptions.end = arr[arr.length - 1].endTime || '18:00'
        }
      })
    },
    // 日期返回改变
    handleDateRangeChange(val) {
      // 刷新
      this.handleFilter()
    },
    handleStartTimeChange(val) {
      console.log(val)
    },
    handleEndTimeChange(val) {
      console.log(val)
    },
    handleFilter() {
      this.query.beginDate = this.dateRange[0]
      this.query.endDate = this.dateRange[1]
      this.query.beginTime = this.startTime
      this.query.endTime = this.endTime
      this.loadReserveCountList()
    },
    handleClear() {
      this.dateRange = ['', '']
      this.startTime = ''
      this.endTime = ''
      this.query.beginDate = null
      this.query.endDate = null
      this.query.beginTime = null
      this.query.endTime = null
      this.loadReserveCountList()
    },
    // 单元格点击事件
    handleResourceClick(obj, row, rowIndex, columnIndex) {
      if (this.term) {
        const resourceGroups = this.term.resourceGroups || []
        let index = -1
        for (let i = 0; i < resourceGroups.length; i++) {
          if (obj.resourceGroup.id === resourceGroups[i].id) {
            index = i
            break
          }
        }
        if (index !== -1) {
          const changed = row.list[columnIndex].used !== this.originalTableData[rowIndex].list[columnIndex].used
          const hasLeft = row.list[columnIndex].left > 0
          console.log(':' + changed + ',' + hasLeft)
          if (changed || hasLeft) {
            this.$emit('on-item-click', obj, changed, hasLeft)
          }
        } else {
          const resourceGroups = this.term.resourceGroups || []
          const names = []
          for (let i = 0; i < resourceGroups.length; i++) {
            names.push(resourceGroups[i].name)
          }
          this.$message('该套餐只能使用:[' + names.join(',') + ']进行预约')
        }
      }
    },
    changeResourceCount(obj, num) {
      if (obj.hasOwnProperty('index')) {
        this.tableData[obj.index].list[obj.columnIndex].left += num
        this.tableData[obj.index].list[obj.columnIndex].used -= num
      } else {
        console.log(obj)
        let index = -1
        for (let i = 0; i < this.tableData.length; i++) {
          if (this.tableData[i].resourceGroup.id === obj.resourceGroup.id) {
            index = i
            break
          }
        }
        console.log(index)
        if (index === -1) {
          return
        }

        let columnIndex = -1
        for (let i = 0; i < this.tableData[index].list.length; i++) {
          if (this.tableData[index].list[i].date === obj.date && this.tableData[index].list[i].workTime.id === obj.workTime.id) {
            columnIndex = i
            break
          }
        }
        console.log(columnIndex)
        if (columnIndex === -1) {
          return
        }
        this.tableData[index].list[columnIndex].left += num
        this.tableData[index].list[columnIndex].used -= num
      }
    },
    reset() {
      this.loading = true
      this.tableColumnData = cloneDeep(this.originalTableColumnData)
      this.tableData = cloneDeep(this.originalTableData)
      setTimeout(() => {
        this.loading = false
      }, 300)
    },
    // 单元格样式
    tableCellClassMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex > 0) {
        const resourceGroupId = row.resourceGroup.id
        if (row.list[columnIndex - 1].used !== this.originalTableData[rowIndex].list[columnIndex - 1].used) {
          return 'resourceGroup-used'
        }
        for (let i = 0; i < this.currentResourceGroups.length; i++) {
          if (resourceGroupId === this.currentResourceGroups[i].id) {
            // 没有预约次数的时候, 修改样式
            if (row.list[columnIndex - 1].left === 0) {
              return 'resourceGroup-no-left'
            } else {
              return 'resourceGroup-available'
            }
          }
        }
        // 没有预约次数的时候, 修改样式
        if (row.list[columnIndex - 1].left === 0) {
          return 'resourceGroup-no-left'
        }
        return 'resourceGroup-disable'
      }
    },
    // 刷新数据
    refresh(comId, manual) {
      if (comId !== this.query.comId || manual) {
        this.query.comId = comId
        this.loadReserveCountList()
      }
    },
    // 加载列表数据
    loadReserveCountList() {
      if (!this.query) {
        return
      }
      this.loading = true
      getReserveCountList2(this.query).then(res => {
        if (res) {
          this.tableColumnData = res.times
          this.originalTableColumnData = cloneDeep(res.times)
          this.tableData = res.list
          this.originalTableData = cloneDeep(res.list)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 获取日期时间
    getWorkTimeLabel(date, workTime) {
      return parseTime(date, '{m}-{d}') + ' ' + workTime.beginTime
    }
  }
}
</script>

<style lang="less" scoped>
.filter-container {
  margin-bottom: 10px;
  label {
    margin-left: 10px;
    color: #333;
    font-size: 12px;
    &:first-child {
      margin-left: 0;
    }
  }
}
</style>
<style>
.el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: transparent;
}
.el-table .el-table__body .el-table__row td.resourceGroup-available {
  background-color: green;
  color: white;
}
.el-table .el-table__body .el-table__row td.resourceGroup-disable {
  background-color: #33000000;
  color: #333;
}
.el-table .el-table__body .el-table__row td.resourceGroup-no-left {
  background-color: #ff3333;
  color: white;
}
.el-table .el-table__body .el-table__row td.resourceGroup-used {
  background-color: deepskyblue;
  color: white;
}
.resourceGroup-count-changed {
  color: white;
}
.resourceGroup-disabled {
}

.reserve-time-wrapper .el-range-editor .el-range-separator {
  padding: 0;
}
.reserve-time-wrapper .el-table--small th, .reserve-time-wrapper .el-table--small td {
  padding: 0;
}
.reserve-time-wrapper .el-table .cell {
  padding: 0;
}
</style>
