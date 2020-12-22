<template>
  <div class="app-container">
    <!-- 用户列表 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--工具栏-->
          <div class="head-container">
            <div>
              <!-- 搜索 -->
              <el-select v-model="query.infoType" placeholder="请选择">
                <el-option label="电话" value="PHONE" />
                <el-option label="姓名" value="NAME" />
                <el-option label="病案号" value="MRN" />
              </el-select>
              <el-input v-model="query.patientInfo" clearable size="small" placeholder="输入查询条件" style="width: 200px;" />
            </div>
            <rrOperation />
          </div>
          <!--表格渲染-->
          <div v-if="crud.data && crud.data.length > 0">
            <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
              <el-table-column prop="patientId" label="PatientId" />
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="certNo" label="身份证号" />
              <el-table-column prop="phone" label="手机号" />
            </el-table>
          </div>
        </el-card>
      </el-col>
      <!-- 用户详情列表 -->
      <div>
        <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
          <el-card class="box-card">
            <queryDetail ref="queryDetail" @item-select-changed="handleItemCurrentChange" />
          </el-card>
        </el-col>
      </div>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <itemReserveDetail ref="itemReserveDetail" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import queryDetail from './queryDetail'
import itemReserveDetail from './itemReserveDetail'
import crudRcvUser from '@/api/recovery/rcvUser'

import checkPermission from '@/utils/permission'
import CRUD, { presenter, header } from '@crud/crud'
import rrOperation from '@crud/RR.operation'

export default {
  name: 'UserQuery',
  components: { rrOperation, queryDetail, itemReserveDetail },
  cruds() {
    return [
      CRUD({
        title: '用户查询',
        url: '/api/patient/patient/query',
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
        add: ['admin', 'rcvUser:add'],
        edit: ['admin', 'rcvUser:edit'],
        del: ['admin', 'rcvUser:del']
      }
    }
  },
  methods: {
    checkPermission,
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      if (this.$refs.queryDetail) {
        this.$refs.queryDetail.query.userId = null
      }
      return true
    },
    // 选中字典后，设置字典详情数据
    handleCurrentChange(val) {
      console.log(val)
      if (val) {
        this.$refs.queryDetail.query.userId = val.id
        this.$refs.queryDetail.userId = val.id
        this.$refs.queryDetail.crud.toQuery()
      }
    },
    handleItemCurrentChange(val) {
      console.log(val)
      if (val) {
        this.$refs.itemReserveDetail.query.itemCode = val.itemCode
        this.$refs.itemReserveDetail.crud.toQuery()
      }
    }
  }
}
</script>

<style scoped>
</style>
