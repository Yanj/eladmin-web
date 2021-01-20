<template>
  <div class="app-container">
    <div>
      <hospital-picker
        :value="currentHospital"
        @change="handleHospitalChange"
      />
    </div>
    <div style="margin-top: 10px">
      <bar-chart :term-count="termCount" />
    </div>
  </div>
</template>

<script>
import { getTermCount } from '@/api/yy/reserve'

import hospitalPicker from '@/views/yy/hospital/hospitalPicker'
import BarChart from './components/BarChart'

import { getWeekDate, formatDate } from '@/utils'

export default {
  name: 'StatisticReserveCount',
  components: {
    hospitalPicker,
    BarChart
  },
  data() {
    return {
      currentHospital: { id: null },
      deptId: 32,
      termCount: {
        dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        data: []
      }
    }
  },
  mounted() {
  },
  methods: {
    // 查询 - 选择医院事件
    handleHospitalChange(val) {
      this.currentHospital = val
      this.deptId = val.id
      this.getTermCount()
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
      })
    }
  }
}
</script>

<style></style>
