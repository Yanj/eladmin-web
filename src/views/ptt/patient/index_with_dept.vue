<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--工具栏-->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input v-model="query.name" clearable size="small" placeholder="输入患者名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
              <rrOperation />
            </div>
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
            <el-table-column label="医院" prop="dept_name" />
            <el-table-column label="患者" prop="patient_name" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <query-cus-detail ref="queryCusDetail" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudApi from '@/api/ptt/patient'

import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'

import queryCusDetail from '@/views/ptt/patient/queryCusDetail'

export default {
  name: 'PatientWithDept',
  components: { rrOperation, queryCusDetail },
  cruds() {
    return CRUD({ title: '患者管理', url: 'api/ptt/patient/listWithDept', crudMethod: { ...crudApi }})
  },
  mixins: [presenter(), header(), crud()],
  // 设置数据字典
  dicts: [''],
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
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {

    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      return true
    },
    handleCurrentChange(val) {
      console.log(val)
      if (val) {
        this.$refs.queryCusDetail.query.deptId = val['dept_dept_id']
        this.$refs.queryCusDetail.query.patientId = val['patient_id']
        this.$refs.queryCusDetail.crud.toQuery()
      }
    }
  }
}
</script>

<style scoped>

</style>

