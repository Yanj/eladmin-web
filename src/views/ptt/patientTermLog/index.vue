<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.termName" clearable size="small" placeholder="输入套餐名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
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
      <el-table-column :selectable="checkboxT" type="selection" width="55" />
      <el-table-column label="套餐" prop="term.name" />
      <el-table-column label="患者" prop="patientTerm.patient.name" />
      <el-table-column label="变更前次数" prop="beforeTimes" />
      <el-table-column label="变更后次数" prop="afterTimes" />
      <el-table-column label="变更内容" prop="content" />
    </el-table>
  </div>
</template>

<script>
import crudDept from '@/api/ptt/patient'

import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'

export default {
  name: 'PatientTermLog',
  components: { crudOperation, rrOperation },
  cruds() {
    return CRUD({
      title: '患者套餐日志',
      url: 'api/ptt/patientTermLog',
      optShow: { add: false, edit: false, del: false, download: true },
      crudMethod: { ...crudDept }
    })
  },
  mixins: [presenter(), header(), crud()],
  // 设置数据字典
  dicts: [],
  data() {
    return {
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
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {

    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      return true
    },
    checkboxT(row, rowIndex) {
      return row.id !== 1
    }
  }
}
</script>

<style scoped>

</style>

