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
          <el-select v-model="form.dept.id" placeholder="请选择">
            <el-option v-for="item in orgs" :key="item.name" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="最大数量" prop="maxCount">
          <el-input v-model="form.maxCount" style="width: 370px;" />
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
      <el-table-column :selectable="checkboxT" type="selection" width="55" />
      <el-table-column label="医院" prop="dept.name" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="最大数量" prop="maxCount" />
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','resourceType:edit','resourceType:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudDept from '@/api/ptt/resourceType'
import { getOrgs } from '@/api/ptt/org'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = {
  id: null,
  dept: { id: null },
  name: null,
  maxCount: 0,
  status: null,
  remark: null
}
export default {
  name: 'ResourceType',
  components: { crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({ title: '资源类型管理', url: 'api/ptt/resourceType', crudMethod: { ...crudDept }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        maxCount: [
          { required: true, message: '请输入最大数量', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'resourceType:add'],
        edit: ['admin', 'resourceType:edit'],
        del: ['admin', 'resourceType:del']
      },
      orgs: []
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getOrgs()
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.dept === null || this.form.pid === null) {
        this.$message({
          message: '所属医院不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },
    checkboxT(row, rowIndex) {
      return row.id !== 1
    },
    getOrgs() {
      getOrgs({ isPaged: false }).then(res => {
        console.log(res)
        this.orgs = res.content
      })
    }
  }
}
</script>

<style scoped>

</style>

