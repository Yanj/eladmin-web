<template>
  <div>
    <el-table :data="tableData">
      <el-table-column label="时段">
        <template slot-scope="scope">
          <div>{{ scope.row.date }} {{ scope.row.workTime.beginTime }} - {{ scope.row.workTime.endTime }}</div>
        </template>
      </el-table-column>
      <el-table-column v-for="item in resourceGroups" :key="item.id" :label="item.name">
        <template slot-scope="scope">
          <div @click.stop="handleResourceClick(item, scope.row.workTime)">{{ scope.row.countMap[item.id+''] }}</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getAllResourceGroups } from '@/api/yy/resourceGroup'
import { getReserveCountList } from '@/api/yy/reserveResource'

export default {
  name: 'ReserveTime',
  components: {},
  props: {
    deptId: {
      type: Number,
      default: null
    }
  },
  data: function() {
    return {
      query: {
        deptId: null
      },
      resourceGroups: [],
      tableData: []
    }
  },
  watch: {
    deptId: function(val) {
      this.refresh(val)
    }
  },
  created() {
    this.query.deptId = this.deptId
  },
  mounted() {
    this.loadResourceGroups()
  },
  methods: {
    handleResourceClick(resource, workTime) {},
    // 刷新数据
    refresh(deptId, manual) {
      if (deptId !== this.query.deptId || manual) {
        this.query.deptId = deptId
        this.loadResourceGroups()
      }
    },
    // 刷新数据
    loadResourceGroups() {
      if (this.query && this.query.deptId) {
        getAllResourceGroups({ deptId: this.query.deptId }).then(res => {
          console.log(res)
          this.resourceGroups = res
          this.loadReserveCountList()
        })
      }
    },
    loadReserveCountList() {
      getReserveCountList(this.query.deptId).then(res => {
        console.log(res)
        this.tableData = res
      })
    }
  }
}
</script>

<style lang="less" scoped></style>
<style></style>
