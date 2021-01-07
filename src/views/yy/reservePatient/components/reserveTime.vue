<template>
  <div>
    <el-table v-loading="loading" :data="tableData" :span-method="tableSpanMethod" :cell-class-name="tableCellClassMethod">
      <el-table-column label="日期" prop="date" align="center" />
      <el-table-column label="时段" align="center">
        <template slot-scope="scope">
          <div>
            {{ scope.row.workTime.beginTime }} - {{ scope.row.workTime.endTime }}</div>
        </template>
      </el-table-column>
      <el-table-column v-for="item in resourceGroups" :key="item.id" :label="item.name" align="center">
        <template slot-scope="scope">
          <div style="background: #00000000;" @click.stop="handleResourceClick({resourceGroup: item, date: scope.row.date, workTime: scope.row.workTime, index: scope.$index})">
            <label :class="scope.row.leftMap[item.id+''] !== originalTableData[scope.$index].leftMap[item.id+''] ? 'resourceGroup-count-changed': ''">{{ scope.row.leftMap[item.id+''] }}</label>
            <label>/</label>
            <label :class="scope.row.leftMap[item.id+''] === 0 ? 'resourceGroup-disabled':''">{{ scope.row.countMap[item.id+''] }}</label>
          </div>
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
    },
    term: {
      type: Object,
      default: null
    }
  },
  data: function() {
    return {
      query: {
        deptId: null
      },
      resourceGroups: [],
      originalResourceGroups: [],
      tableData: [],
      originalTableData: [],
      loading: false,
      currentResourceGroups: []
    }
  },
  watch: {
    deptId: function(val) {
      this.refresh(val)
    },
    term: function(val) {
      if (val) {
        this.currentResourceGroups = val.resourceGroups || []
      }
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
      if (this.term) {
        const resourceGroups = this.term.resourceGroups || []
        let index = -1
        for (let i = 0; i < resourceGroups.length; i++) {
          if (obj.resourceGroup.id === resourceGroups[i].id) {
            index = i
            break
          }
        }
        if (index !== -1) {
          this.$emit('on-item-click', obj)
        } else {
          const resourceGroups = this.term.resourceGroups || []
          const names = []
          for (let i = 0; i < resourceGroups.length; i++) {
            names.push(resourceGroups[i].name)
          }
          this.$message('该套餐只能使用:[' + names.join(',') + ']进行预约')
        }
      }
    },
    changeResourceCount(obj, num) {
      if (obj.hasOwnProperty('index')) {
        this.tableData[obj.index].leftMap[obj.resourceGroup.id + ''] += num
        this.tableData[obj.index].usedMap[obj.resourceGroup.id + ''] -= num
      } else {
        console.log(obj)
        let index = -1
        for (let i = 0; i < this.tableData.length; i++) {
          if (this.tableData[i].date === obj.date && this.tableData[i].workTime.id === obj.workTime.id) {
            index = i
            break
          }
        }
        console.log(index)
        if (index !== -1) {
          this.tableData[index].leftMap[obj.resourceGroup.id + ''] += num
          this.tableData[index].usedMap[obj.resourceGroup.id + ''] -= num
        }
      }
    },
    reset() {
      this.loading = true
      this.resourceGroups = JSON.parse(JSON.stringify(this.originalResourceGroups))
      this.tableData = JSON.parse(JSON.stringify(this.originalTableData))
      setTimeout(() => {
        this.loading = false
      }, 300)
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
    // 单元格样式
    tableCellClassMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex > 1) {
        for (let i = 0; i < this.currentResourceGroups.length; i++) {
          if (this.resourceGroups[columnIndex - 2].id === this.currentResourceGroups[i].id) {
            return 'resourceGroup-available'
          }
        }
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
        this.loading = true
        getAllResourceGroups({ deptId: this.query.deptId }).then(res => {
          this.resourceGroups = JSON.parse(JSON.stringify(res))
          this.originalResourceGroups = res
          // 加载列表数据
          this.loadReserveCountList()
        })
      }
    },
    // 加载列表数据
    loadReserveCountList() {
      getReserveCountList(this.query.deptId).then(res => {
        this.tableData = JSON.parse(JSON.stringify(res))
        this.originalTableData = res
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
<style>
.el-table td.resourceGroup-available {
  background-color: #F5F7FA !important;
}
.resourceGroup-count-changed {
  color: green;
}
.resourceGroup-disabled {
  color: red;
}
</style>
