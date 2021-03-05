<template>
  <div class="dashboard-container">
    <div class="dashboard-editor-container">
      <hospital-picker
        :value="currentHospital"
        @change="handleHospitalChange"
      />
      <panel-group :value="todayCount" @handleSetLineChartData="handleSetLineChartData" />
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <bar-horizental-chart :height="termHorizentalHeight" :terms="termHorizentalCount" :title="{text:'预约统计',subtext:'最近一周预约统计'}" />
      </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <line-chart :chart-data="lineChartData" />
      </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <single-line-chart :chart-data="workTimeCount" />
      </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <bar-chart :term-count="termCount" />
      </el-row>
      <el-row v-show="false" :gutter="32">
        <el-col v-show="false" :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <radar-chart />
          </div>
        </el-col>
        <el-col v-show="false" :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <pie-chart />
          </div>
        </el-col>
        <el-col v-show="false" :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <bar-chart :term-count="termCount" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import hospitalPicker from '@/views/yy/hospital/hospitalPicker'
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import SingleLineChart from './dashboard/SingleLineChart'
import RadarChart from '@/components/Echarts/RadarChart'
import PieChart from '@/components/Echarts/PieChart'
// import BarChart from '@/components/Echarts/BarChart'
import BarChart from '@/views/dashboard/BarChart'
import BarHorizentalChart from '@/views/dashboard/BarHorizentalChart'

import { getTodayCount, getWeekCount, getWorkTimeCount, getTermCount } from '@/api/yy/reserve'

import { getWeekDate, formatDate } from '@/utils'

export default {
  name: 'Dashboard',
  components: {
    hospitalPicker,
    PanelGroup,
    LineChart,
    SingleLineChart,
    RadarChart,
    PieChart,
    BarChart,
    BarHorizentalChart
  },
  data() {
    return {
      deptId: 32,
      currentHospital: { id: null },
      todayCount: {
        totalCount: 0,
        preprocessCount: 0,
        processingCount: 0,
        processedCount: 0
      },
      weekCount: [
        {
          all: [0, 0, 0, 0, 0, 0, 0],
          init: [0, 0, 0, 0, 0, 0, 0],
          checkIn: [0, 0, 0, 0, 0, 0, 0],
          verified: [0, 0, 0, 0, 0, 0, 0]
        },
        {
          all: [0, 0, 0, 0, 0, 0, 0],
          init: [0, 0, 0, 0, 0, 0, 0],
          checkIn: [0, 0, 0, 0, 0, 0, 0],
          verified: [0, 0, 0, 0, 0, 0, 0]
        }
      ],
      lineChartData: {
        actualData: [0, 0, 0, 0, 0, 0, 0],
        expectedData: [0, 0, 0, 0, 0, 0, 0]
      },
      workTimeCount: {
        workTimes: ['08:00', '08:30', '09:00'],
        actualData: [0, 0, 0]
      },
      termCount: {
        dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        data: []
      },
      termHorizentalHeight: '600px',
      termHorizentalCount: {
        names: [], // 套餐名称
        data: []
      }
    }
  },
  mounted() {
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = {
        actualData: this.weekCount[0][type],
        expectedData: this.weekCount[1][type]
      }
    },
    // 查询 - 选择医院事件
    handleHospitalChange(val) {
      this.currentHospital = val
      this.deptId = val.id
      this.getTodayCount()
      this.getWeekCount()
      this.getWorkTimeCount()
      this.getTermCount()
    },
    getTodayCount() {
      getTodayCount(this.deptId).then(res => {
        this.todayCount = res
      })
    },
    getWeekCount() {
      getWeekCount(this.deptId).then(res => {
        this.weekCount = res
        this.lineChartData = {
          actualData: this.weekCount[0].all,
          expectedData: this.weekCount[1].all
        }
      })
    },
    getWorkTimeCount() {
      getWorkTimeCount(this.deptId).then(res => {
        this.workTimeCount = {
          workTimes: res.workTimes,
          actualData: res.counts,
          expectedData: res.prevCounts
        }
      })
    },
    getTermCount() {
      const monday = formatDate(getWeekDate(0))
      const params = {
        deptId: this.deptId,
        date: monday,
        days: 7
      }
      getTermCount(params).then(res => {
        this.termCount = {
          dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          data: res
        }

        const names = []
        for (let i = 0; i < res.length; i++) {
          names.push(res[i].name)
        }

        const data = []
        const legend = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        for (let i = 0; i < legend.length; i++) {
          const arr = []
          for (let j = 0; j < res.length; j++) {
            arr.push(res[j].data[i])
          }
          data.push({
            name: legend[i],
            data: arr
          })
        }
        this.termHorizentalCount = {
          legend,
          names,
          data
        }
        console.log(this.termHorizentalCount)
        if (names.length <= 6) {
          this.termHorizentalHeight = '600px'
        } else {
          this.termHorizentalHeight = ((names.length - 1) * 50) + 'px'
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .github-corner {
      position: absolute;
      top: 0;
      border: 0;
      right: 0;
    }

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }

  @media (max-width:1024px) {
    .chart-wrapper {
      padding: 8px;
    }
  }
</style>
