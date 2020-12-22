<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable size="small" placeholder="输入患者名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
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
      @current-change="handleCurrentChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="电话" prop="phone" />
    </el-table>
  </div>
</template>

<script>
import crudApi from '@/api/ptt/patient'

import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'

export default {
  name: 'PatientList',
  components: { crudOperation, rrOperation },
  cruds() {
    return CRUD({ title: '患者列表', url: 'api/ptt/patient', crudMethod: { ...crudApi }, optShow: { add: false, edit: false, del: false, download: false }})
  },
  mixins: [presenter(), header(), crud()],
  // 设置数据字典
  dicts: ['dept_status'],
  data() {
    return {
      permission: {
      }
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.$emit('patient-selection-change', val)
    }
  }
}
</script>

<style scoped>

</style>
