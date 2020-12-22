<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable size="small" placeholder="输入类型名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="医院">
          <el-select v-model="form.dept.id" placeholder="请选择" @change="handleOrgChange">
            <el-option v-for="item in orgs" :key="item.name" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="form.resourceType.id" placeholder="请选择">
            <el-option v-for="item in resourceTypes" :key="item.name" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="数量" prop="count">
          <el-input v-model="form.count" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
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
      <el-table-column label="医院" prop="dept.name" />
      <el-table-column label="资源类型" prop="resourceType.name" />
      <el-table-column label="编码" prop="code" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="数量" prop="count" />
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','resource:edit','resource:del']" label="操作" width="130px" align="center" fixed="right">
        <template slot-scope="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
            :disabled-dle="scope.row.id === 1"
            msg="确定删除吗?"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudDept from '@/api/ptt/resource'
import { getOrgs } from '@/api/ptt/org'
import { getResourceTypes } from '@/api/ptt/resourceType'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = {
  id: null,
  dept: { id: null },
  resourceType: { id: null },
  code: null,
  name: null,
  count: 0,
  status: null,
  remark: null
}
export default {
  name: 'Resource',
  components: { crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({ title: '资源管理', url: 'api/ptt/resource', crudMethod: { ...crudDept }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      rules: {
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        count: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'resource:add'],
        edit: ['admin', 'resource:edit'],
        del: ['admin', 'resource:del']
      },
      orgs: [],
      resourceTypes: []
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getOrgs()
      if (form.id !== null) {
        if (form.resourceType !== null && form.resourceType.id !== null) {
          this.getResourceTypes(form.dept.id)
        }
      } else {
        form.dept.id = null
        form.resourceType.id = null
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.dept === null || this.form.dept.id === null) {
        this.$message({
          message: '所属医院不能为空',
          type: 'warning'
        })
        return false
      }
      if (this.form.resourceType === null || this.form.resourceType.id === null) {
        this.$message({
          message: '所属资源类型不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },
    getOrgs() {
      getOrgs({ isPaged: false }).then(res => {
        this.orgs = res.content
      })
    },
    getResourceTypes(deptId) {
      getResourceTypes({ deptId }).then(res => {
        this.resourceTypes = res.content
      })
    },
    handleOrgChange(orgId) {
      this.getResourceTypes(orgId)
    }
  }
}
</script>

<style scoped>

</style>

