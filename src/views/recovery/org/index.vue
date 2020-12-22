<template>
  <div class="app-container">
    <!--表单组件-->
    <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="机构名称">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="机构地址">
          <el-input v-model="form.address" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contactName" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio v-for="item in dict.rcv_org_status" :key="item.id" v-model="form.status" :label="item.value">{{ item.label }}</el-radio>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!-- 机构列表 -->
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px;">
        <el-card class="box-card">
          <!-- 工具栏 -->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input v-model="query.blurry" clearable size="small" placeholder="输入名称或者地址搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
              <rrOperation />
            </div>
            <crudOperation :permission="permission" />
            <!--表格渲染-->
            <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="机构名称" />
              <el-table-column prop="address" label="机构地址" />
              <el-table-column prop="contactName" label="联系人" />
              <el-table-column prop="contactPhone" label="联系电话" />
              <el-table-column prop="status" label="状态">
                <template slot-scope="scope">
                  <span v-for="item in dict.rcv_org_status" :key="item.id">
                    <span v-if="scope.row.status === item.value">{{ item.label }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" />
              <el-table-column v-permission="['admin','rcvOrg:edit','rcvOrg:del']" label="操作" width="150px" align="center">
                <template slot-scope="scope">
                  <udOperation
                    :data="scope.row"
                    :permission="permission"
                  />
                </template>
              </el-table-column>
            </el-table>
            <!--分页组件-->
            <pagination />
          </div>
        </el-card>
      </el-col>
      <!-- 部门详情列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>机构详情</span>
            <el-button
              v-if="checkPermission(['admin','rcvOrg:add']) && this.$refs.deptDetail && this.$refs.deptDetail.query.orgName"
              class="filter-item"
              size="mini"
              style="float: right;padding: 4px 10px"
              type="primary"
              icon="el-icon-plus"
              @click="$refs.deptDetail && $refs.deptDetail.crud.toAdd()"
            >新增</el-button>
          </div>
          <deptDetail ref="deptDetail" :permission="permission" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import deptDetail from './deptDetail'
import crudRcvOrg from '@/api/recovery/rcvOrg'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, address: null, contactName: null, contactPhone: null, status: null, remark: null }
export default {
  name: 'RcvOrg',
  components: { pagination, crudOperation, rrOperation, udOperation, deptDetail },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['rcv_org_status'],
  cruds() {
    return CRUD({ title: '机构', url: 'api/recovery/rcvOrg', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvOrg }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvOrg:add'],
        edit: ['admin', 'rcvOrg:edit'],
        del: ['admin', 'rcvOrg:del']
      },
      rules: {
        name: [
          { required: true, message: '机构名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    checkPermission,
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      if (this.$refs.dictDetail) {
        this.$refs.deptDetail.query.orgName = ''
      }
      return true
    },
    // 选中字典后，设置字典详情数据
    handleCurrentChange(val) {
      if (val) {
        this.$refs.deptDetail.query.orgName = val.name
        this.$refs.deptDetail.orgId = val.id
        this.$refs.deptDetail.crud.toQuery()
      }
    }
  }
}
</script>

<style scoped>

</style>
