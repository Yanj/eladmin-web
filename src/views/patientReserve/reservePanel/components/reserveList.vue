<template>
  <div class="reserveList-panel">
    <div class="panel-title-container">
      <div class="panel-title">预约列表</div>
      <div class="panel-title-more" @click="handleClear">清空</div>
    </div>
    <div class="list-outer">
      <div v-if="reserveList && reserveList.length > 0" class="list-container">
        <div v-for="(item, index) in reserveList" :key="item.id" class="list-item-container" @click="handleListItemClick(item, index)">
          <div class="list-item-row">
            <label>预约套餐: </label>
            <span v-if="item.patientTerm">{{ item.patientTerm.termName }}</span>
            <span v-else-if="item.term">{{ item.term.name }}</span>
            <span v-else>-</span>
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

export default {
  name: 'ReserveList',
  props: {
    reserveList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data: function() {
    return {
    }
  },
  created() {
  },
  methods: {
    handleClear() {
      this.$emit('clear')
    },
    handleListItemClick(item, index) {
      this.$emit('item-click', { item, index })
    }
  }
}
</script>

<style lang="less" scoped>
.reserveList-panel {
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
            color: #333;
            margin-left: 10px;
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
