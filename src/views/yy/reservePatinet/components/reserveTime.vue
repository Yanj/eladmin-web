<template>
  <div>
    <el-table :data="tableData">
      <el-table-column label="时段">
        <template slot-scope="scope">
          <div>{{ scope.row.date }} {{ scope.row.workTime.beginTime }} - {{ scope.row.workTime.endTime }}</div>
        </template>
      </el-table-column>
      <el-table-column v-for="item in resources" :key="item.id" :label="item.name">
        <template slot-scope="scope">
          <div @click.stop="handleResourceClick(item, scope.row.workTime)">{{ scope.row.countMap[item.id+''] }} / {{ item.count }}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

export default {
  name: 'ReserveTime',
  components: {},
  props: {},
  data: function() {
    return {
      resources: [],
      tableData: []
    }
  },
  watch: {},
  created() {
  },
  mounted() {
  },
  methods: {
    handleResourceClick(resource, workTime) {}
  }
}
</script>

<style lang="less" scoped></style>
<style></style>
