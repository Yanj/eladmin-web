<template>
  <div>
    <!--操作-->
    <div style="float: right; padding: 6px 9px">
      <el-button
        icon="el-icon-check"
        size="mini"
        type="primary"
        :disabled="reserveList.length <= 0"
        @click="saveReserve"
      >
        保存
      </el-button>
      <el-button
        icon="el-icon-refresh-left"
        size="mini"
        :disabled="reserveList.length <= 0"
        @click="cancelReserve"
      >
        取消
      </el-button>
    </div>
    <!--表格-->
    <el-table :data="reserveTimeSubList">
      <el-table-column label="时间" width="100">
        <template slot-scope="scope">
          <div style="display:flex;flex-direction: column;justify-content: center;align-items: center;">
            <div>{{ scope.row.beginTime }}</div>
            <div>-</div>
            <div>{{ scope.row.endTime }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="key in reserveTimeListKeys"
        :key="key"
        :label="key"
        width="150"
      >
        <template slot-scope="scope">
          <div
            class="time-item-container"
            @click="handleTimeItemClick(key, scope.$index)"
          >
            <!-- 次数 -->
            <div
              :class="reserveTimeList[key][scope.$index].available > 0 ? 'available' : 'unavailable'"
              class="times-container"
            >
              <span>{{ reserveTimeList[key][scope.$index].available }}</span>
              /
              <span>{{ reserveTimeList[key][scope.$index].count }}</span>
            </div>
            <div class="patient-container">
              <!-- 遍历已预约患者列表 -->
              <div
                v-for="patientTermItem in reserveTimeList[key][scope.$index].patientTermReserveList"
                :key="patientTermItem.id"
                :class="patientTermItem.patientTerm.patient.id === patientTerm.patient.id ? 'self' : ''"
                class="patient-item"
              >
                {{ patientTermItem.patientTerm.patient.name }}
              </div>
              <!-- 遍历用户选中列表 -->
              <div
                v-for="(reserveItem, index) in reserveList"
                :key="index"
                class="patient-item selected"
              >
                <div v-if="reserveItem.date === key && reserveItem.beginTime === reserveTimeList[key][scope.$index].beginTime">
                  {{ patientTerm.patient.name }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

import apiPatientTermReserve from '@/api/ptt/patientTermReserve'
import { getTimeList } from '@/api/ptt/term'

export default {
  comments: {},
  data() {
    return {
      deptId: null,
      patientTerm: {},
      reserveTimeList: {
        '2020-12-12': []
      },
      reserveTimeListKeys: [],
      reserveTimeSubList: [],
      reserveList: []
    }
  },
  created() {
    // this.getTimeList()
  },
  methods: {
    reload() {
      this.getTimeList()
      this.reserveList = []
    },
    getTimeList() {
      const params = {
        deptId: this.deptId,
        termId: this.patientTerm.term.id
      }
      getTimeList(params).then(res => {
        // this.timeList = res
        this.reserveTimeList = res
        this.reserveTimeListKeys = Object.keys(res)
        // 取第一个日期的列表作为循环子集
        this.reserveTimeSubList = res[this.reserveTimeListKeys[0]]
      })
    },
    handleTimeItemClick(date, index) {
      const reserveTimeItem = this.reserveTimeList[date][index]
      // 判断是否已经预约
      if (reserveTimeItem.patientTermReserveList) {
        let reserved = false
        for (let i = 0; i < reserveTimeItem.patientTermReserveList.length; i++) {
          if (reserveTimeItem.patientTermReserveList[i].patient.id === this.patientTerm.patient.id) {
            reserved = true
          }
        }
        if (reserved) {
          return
        }
      }
      // 新增或者删除预约列表
      let itemInArrayIndex = -1
      for (let i = 0; i < this.reserveList.length; i++) {
        if (this.reserveList[i].date === reserveTimeItem.date && this.reserveList[i].beginTime === reserveTimeItem.beginTime) {
          itemInArrayIndex = i
          break
        }
      }
      if (itemInArrayIndex < 0) {
        this.reserveList.push(reserveTimeItem)
      } else {
        this.reserveList.splice(itemInArrayIndex, 1)
      }
    },
    saveReserve() {
      if (this.reserveList.length <= 0) {
        return
      }
      const data = []
      for (let i = 0; i < this.reserveList.length; i++) {
        data.push({
          patientTerm: this.patientTerm,
          term: this.patientTerm.term,
          dept: { id: this.deptId },
          date: this.reserveList[i].date,
          beginTime: this.reserveList[i].beginTime,
          endTime: this.reserveList[i].endTime
        })
      }
      apiPatientTermReserve.reserve(data).then(res => {
        this.reload()
        this.$emit('on-reserve', {})
      })
    },
    cancelReserve() {
      this.reserveList = []
    }
  }
}
</script>

<style>
.time-item-container {
  width: 100%;
  min-height: 36px;
}
.available {
  background-color: #13ce66;
}
.unavailable {
  background-color: #ff4949;
}
.time-item-container .times-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.time-item-container .patient-item-container {
  width: 100%;
}
.patient-container {
  display: block;
}
.patient-item {
  display: block;
  color: #00a0e9;
  text-align: center;
}
.patient-item.self {
  color: #13ce66;
}
.patient-item.selected {
  color: #ff4949;
}
</style>
