<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
      <el-button
        class="filter-item"
        size="small"
        type="primary"
        @click="handleQuery"
      >查询</el-button>
    </div>
    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="套餐" prop="termName" align="center" />
      <el-table-column label="总数量" prop="totalTimes" align="center" />
      <el-table-column label="剩余数量" prop="times" align="center" />
      <el-table-column label="已用数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.totalTimes - scope.row.times }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import patientTermTimesCountApi from '@/api/statistics/patientTermTimesCount'

import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

export default {
  name: 'PatientTermTimesCount',
  components: { deptPicker },
  mixins: [hasAdminPermission()],
  props: {},
  data() {
    return {
      query: {
        orgId: null,
        comId: null,
        deptId: null
      },
      loading: false,
      tableData: []
    }
  },
  watch: {},
  created() {
  },
  methods: {
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.loadData()
    },
    handleQuery() {
      this.loadData()
    },
    loadData() {
      this.loading = true
      patientTermTimesCountApi.getPatientTermTimesCount(this.query).then(res => {
        if (res) {
          this.tableData = res
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style>

</style>
