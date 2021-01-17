<template>
  <div class="recentReserveList-panel">
    <div class="panel-title-container">
      <div class="panel-title">最近预约列表</div>
      <div class="panel-title-more" @click="handleShowMore">查看更多</div>
    </div>
    <div class="list-outer">
      <div v-if="list && list.length > 0" class="list-container">
        <div v-for="item in list" :key="item.id" class="list-item-container">
          <div class="list-item-row">
            <label>预约套餐: </label>
            <span>{{ item.patientTerm.termName }}</span>
          </div>
          <div class="list-item-row">
            <label>预约日期:</label>
            <span>{{ item.date }}</span>
          </div>
          <div class="list-item-row">
            <label>预约时段:</label>
            <span>{{ item.workTime.beginTime }}-{{ item.workTime.endTime }}</span>
          </div>
        </div>
      </div>
      <div v-else class="list-empty">没有数据</div>
    </div>
  </div>
</template>

<script>
import { getReserveListByPatientTermId } from '@/api/yy/reserve'

export default {
  name: 'RecentReserveList',
  props: {
    patientTerm: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data: function() {
    return {
      list: []
    }
  },
  watch: {
    patientTerm: function(val) {
      this.loadPatientTermList()
    }
  },
  mounted() {
    this.loadPatientTermList()
  },
  methods: {
    handleShowMore() {
      const query = { patientName: this.patientTerm.patient.name }
      this.$router.replace({ path: '/ptt/reserve', query })
    },
    loadPatientTermList() {
      if (this.patientTerm && this.patientTerm.id) {
        getReserveListByPatientTermId(this.patientTerm.id).then(res => {
          this.list = res.content
        })
      } else {
        this.list = []
      }
    }
  }
}
</script>

<style lang="less" scoped>
.recentReserveList-panel {
  width: 100%;
  height: 100%;
  border: 1px solid #EEE;
  box-sizing: border-box;
  .panel-title-container {
    width: 100%;
    height: 32px;
    border: 1px solid #EEE;
    border-width: 0 0 1px 0;
    box-sizing: border-box;
    background: khaki;
    display: flex;
    align-items: center;
    .panel-title {
      padding: 0 15px;
      font-size: 14px;
      color: #333;
      flex: 1;
    }
    .panel-title-more {
      float: right;
      padding: 0 15px;
      line-height: 32px;
      color: #666;
      font-size: 12px;
    }
  }
  .list-outer {
    .list-empty {
      width: 100%;
      height: 200px;
      color: #999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .list-container {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 15px;
      .list-item-container {
        width: 100%;
        margin-top: 10px;
        padding: 10px 15px;
        box-sizing: border-box;
        border: 1px solid #EEE;
        border-radius: 8px;
        &:first-child {
          margin-top: 0;
        }
        .list-item-row {
          width: 100%;
          margin-top: 5px;
          label {
            color: #666;
            font-size: 12px;
          }
          span {
            margin-left: 10px;
            color: #333;
            font-size: 12px;
          }
          &:first-child {
            margin-top: 0;
          }
        }
      }
    }
  }
}
</style>
<style></style>
