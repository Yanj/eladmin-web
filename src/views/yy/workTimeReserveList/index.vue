<template>
  <div>
    <el-table v-loading="tableLoading" :data="tableData">
      <el-table-column label="资源组">
        <template slot-scope="scope">
          {{ scope.row.resourceGroup.name }}
        </template>
      </el-table-column>
      <el-table-column v-for="(item, index) in tableColumns" :key="index" :label="item.label">
        <template slot-scope="scope">
          <span v-for="(reserve, reserveIndex) in scope.row.list[index].reserves" :key="reserve.id">{{ reserveIndex !== 0 ? ',' : '' }} {{ reserve.patient.name }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

import workTimeApi from '@/api/yy/workTime'
import workTimeReserveListApi from '@/api/yy/workTimeReserveList'

export default {
  name: 'WorkTimeReserveList',
  components: {},
  mixins: [],
  data() {
    return {
      query: {
        orgId: null,
        comId: null,
        deptId: null,
        date: null,
        verifyStatus: null
      },
      tableLoading: false,
      tableColumns: [],
      tableData: []
    }
  },
  created() {
    this.query.comId = 32
    this.query.date = '2021-04-01'
    this.query.verifyStatus = 'init'
    this.loadWorkTimes()
  },
  methods: {
    loadWorkTimes() {
      this.tableLoading = true
      workTimeApi.getAllWorkTimes(this.query).then(res => {
        if (res) {
          const arr = []
          for (let i = 0; i < res.content.length; i++) {
            arr.push({ label: res.content[i].beginTime })
          }
          this.tableColumns = arr
          this.loadData()
        }
      }).catch(() => {
        this.tableLoading = false
      })
    },
    loadData() {
      this.tableLoading = true
      workTimeReserveListApi.getWorkTimeReserveList(this.query).then(res => {
        if (res) {
          this.tableData = res
        }
        this.tableLoading = false
      }).catch(() => {
        this.tableLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
