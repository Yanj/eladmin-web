<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.patientName" clearable size="small" placeholder="输入患者名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      row-key="id"
      @select="crud.selectChange"
      @select-all="crud.selectAllChange"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="患者" prop="patientTermReserve.patientTerm.patient.name" />
      <el-table-column label="套餐" prop="patientTermReserve.patientTerm.termName" />
      <el-table-column label="医院" prop="patientTermReserve.dept.name" />
      <el-table-column label="变更前状态" prop="beforeStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.beforeStatus === '0'">已预约</span>
          <span v-else-if="scope.row.beforeStatus === '1'">已签到</span>
          <span v-else-if="scope.row.beforeStatus === '2'">已核销</span>
          <span v-else-if="scope.row.beforeStatus === '3'">已取消</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="变更后状态" prop="afterStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.afterStatus === '0'">已预约</span>
          <span v-else-if="scope.row.afterStatus === '1'">已签到</span>
          <span v-else-if="scope.row.afterStatus === '2'">已核销</span>
          <span v-else-if="scope.row.afterStatus === '3'">已取消</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="变更内容" prop="content" />
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudApi from '@/api/ptt/patientTermReserveLog'

import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'

export default {
  name: 'PatientTermReserveLog',
  components: { crudOperation, rrOperation },
  cruds() {
    return CRUD({ title: '患者预约日志', url: 'api/ptt/patientTermReserveLog', crudMethod: { ...crudApi }})
  },
  mixins: [presenter(), header(), crud()],
  // 设置数据字典
  dicts: [],
  data() {
    return {
      depts: [],
      rules: {
      },
      permission: {
        add: ['admin', 'patient:add'],
        edit: ['admin', 'patient:edit'],
        del: ['admin', 'patient:del']
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>

