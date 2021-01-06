<template>
  <div>
    <el-table :data="tableData" :span-method="tableSpanMethod">
      <el-table-column label="日期" prop="date" align="center" />
      <el-table-column label="时段" align="center">
        <template slot-scope="scope">
          <div>{{ scope.row.workTime.beginTime }} - {{ scope.row.workTime.endTime }}</div>
        </template>
      </el-table-column>
      <el-table-column v-for="item in resourceGroups" :key="item.id" :label="item.name" align="center">
        <template slot-scope="scope">
          <div style="background: #00000000;" @click.stop="handleResourceClick({resourceGroup: item, workTime: scope.row.workTime, index: scope.$index})">{{ scope.row.leftMap[item.id+''] }} / {{ scope.row.countMap[item.id+''] }}</div>
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
    // 单元格点击事件
    handleResourceClick(obj) {
      this.$emit('on-item-click', obj)
    },
    changeResourceCount(obj, num) {
      this.tableData[obj.index].leftMap[obj.resourceGroup.id + ''] += num
      this.tableData[obj.index].usedMap[obj.resourceGroup.id + ''] -= num
    },
    // 表格行合并
    tableSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        let lastDate = null
        if (rowIndex !== 0) {
          lastDate = this.tableData[rowIndex - 1].date
        }
        // 当数据不一样的时候开始统计总数
        if (lastDate == null || lastDate !== row.date) {
          let count = 0
          for (let i = rowIndex; i < this.tableData.length; i++) {
            if (this.tableData[i].date !== row.date) {
              break
            }
            count++
          }
          return [count, 1]
        }
        return [0, 0]
      }
    },
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
    // 加载列表数据
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
