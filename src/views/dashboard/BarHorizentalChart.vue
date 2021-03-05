<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

const animationDuration = 6000

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '600px'
    },
    title: {
      type: Object,
      default() {
        return {
          text: null,
          subtext: null
        }
      }
    },
    terms: {
      type: Object,
      default: function() {
        return {
          legend: [],
          names: [],
          data: []
        }
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    terms: function(val) {
      this.initChart()
    },
    height: function(val) {
      if (this.chart) {
        this.chart.resize({ height: val })
      }
    }
  },
  mounted() {
    this.initChart()
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 100)
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    window.removeEventListener('resize', this.__resizeHandler)
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      const series = []
      for (let i = 0; i < this.terms.data.length; i++) {
        series.push({
          name: this.terms.data[i].name,
          type: 'bar',
          data: this.terms.data[i].data,
          animationDuration
        })
      }
      const option = {
        title: {
          text: this.title.text,
          subtext: this.title.subtext
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: this.terms.legend
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '4%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: this.terms.names // 套餐
        },
        series: series
      }
      console.log(option)
      if (!this.chart) {
        this.chart = echarts.init(this.$el, 'macarons')
      }
      this.chart.setOption(option)
    }
  }
}
</script>
