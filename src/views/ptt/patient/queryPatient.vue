<template>
  <div>
    <!--工具栏-->
    <div style="display: flex; flex-direction: row; align-items: center;">
      <div style="display: flex; flex-direction: row; align-items: center; margin-right: 20px;">
        <!-- 搜索 -->
        <el-select v-model="query.infoType" placeholder="请选择" style="width:100px;">
          <el-option label="电话" value="PHONE" />
          <el-option label="姓名" value="NAME" />
          <el-option label="病案号" value="MRN" />
        </el-select>
        <el-input v-model="query.patientInfo" clearable size="small" placeholder="输入查询条件" style="margin-left:10px; width: 130px;" />
      </div>
      <rrOperation />
    </div>
    <!--表格渲染-->
    <div>
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        highlight-current-row
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="patientId" label="PatientId" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="mrn" label="档案号" />
        <el-table-column prop="phone" label="手机号" />
      </el-table>
    </div>
  </div>
</template>

<script>
import crudRcvUser from '@/api/recovery/rcvUser'

import CRUD, { presenter, header } from '@crud/crud'
import rrOperation from '@crud/RR.operation'

export default {
  name: 'QueryPatientList',
  components: { rrOperation },
  cruds() {
    return [
      CRUD({
        title: '患者列表',
        url: '/api/ptt/patient/query',
        query: { patientInfo: '', infoType: '' },
        crudMethod: { ...crudRcvUser },
        queryOnPresenterCreated: false
      })
    ]
  },
  mixins: [presenter(), header()],
  data() {
    return {
      permission: {
        add: ['admin', 'patient:add'],
        edit: ['admin', 'patient:edit'],
        del: ['admin', 'patient:del']
      },
      patientTerm: null
    }
  },
  methods: {
    handleCurrentChange(val) {
      if (val) {
        this.$emit('item-select-changed', val)
      }
    }
  }
}
</script>

<style scoped>
</style>
