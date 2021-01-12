<template>
  <div class="dashboard-container">
    <div class="dashboard-editor-container">
      <panel-group :value="todayCount" @handleSetLineChartData="handleSetLineChartData" />
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <line-chart :chart-data="lineChartData" />
      </el-row>
      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <radar-chart />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <pie-chart />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <bar-chart />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RadarChart from '@/components/Echarts/RadarChart'
import PieChart from '@/components/Echarts/PieChart'
import BarChart from '@/components/Echarts/BarChart'

import { getTodayCount, getWeekCount } from '@/api/yy/reserve'

export default {
  name: 'Dashboard',
  components: {
    PanelGroup,
    LineChart,
    RadarChart,
    PieChart,
    BarChart
  },
  data() {
    return {
      detpId: 32,
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
      }
    }
  },
  mounted() {
    this.getTodayCount()
    this.getWeekCount()
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = {
        actualData: this.weekCount[0][type],
        expectedData: this.weekCount[1][type]
      }
    },
    getTodayCount() {
      getTodayCount(this.detpId).then(res => {
        this.todayCount = res
      })
    },
    getWeekCount() {
      getWeekCount(this.detpId).then(res => {
        this.weekCount = res
        this.lineChartData = {
          actualData: this.weekCount[0].all,
          expectedData: this.weekCount[1].all
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
