<template>
  <div class="reserveList-container">
    <div class="reserveList-container-inner">
      <div class="panel-title">预约列表</div>
      <div v-if="typeof list === 'object' && list != null && list.length > 0" class="list-container">
        <div v-for="item in list" :key="item.id" class="list-item-container">
          <div class="list-item-row">
            <label>套餐:</label>
            <span>{{ item.termName }}</span>
          </div>
          <div class="list-item-row">
            <label>预约日期:</label>
            <span>{{ item.date }}</span>
          </div>
          <div class="list-item-row">
            <label>预约时段:</label>
            <span>{{ item.beginTime }} - {{ item.endTime }}</span>
          </div>
          <el-link>删除</el-link>
        </div>
      </div>
      <div v-else class="empty-container">
        <span>没有预约数据</span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ReserveList',
  props: {},
  data: function() {
    return {
      list: []
    }
  },
  created() {
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.reserveList-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: solid 1px #DDDDDD;
  box-sizing: border-box;
  .reserveList-container-inner {
    width: 100%;
    height: 100%;
    .panel-title {
      width: 100%;
      padding: 5px 10px;
      box-sizing: border-box;
    }
    .list-container {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      .list-item-container {
        width: 100%;
        .list-item-row {
          width: 100%;
          label {
            color: #666;
          }
          span {
            color: #333;
          }
        }
      }
    }
    .empty-container {
      width: 100%;
      padding: 40px 0;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #999999;
      font-size: 1.5em;
    }
  }
}
</style>
<style></style>
