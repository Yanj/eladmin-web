<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable size="small" placeholder="输入套餐名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="套餐">
          <el-select v-model="form.term.id" placeholder="请选择">
            <el-option v-for="item in terms" :key="item.name" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
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
        <el-form-item label="是否可以为空" prop="nullable">
          <el-radio-group v-model="form.nullable" size="mini">
            <el-radio-button label="true">是</el-radio-button>
            <el-radio-button label="false">否</el-radio-button>
          </el-radio-group>
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
      <el-table-column label="套餐" prop="term.name" />
      <el-table-column label="医院" prop="dept.name" />
      <el-table-column label="资源类型" prop="resourceType.name" />
      <el-table-column label="是否可以为空" prop="nullable">
        <template slot-scope="scope">
          <span v-if="scope.row.nullable">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','termResourceType:edit','termResourceType:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudDept from '@/api/ptt/termResourceType'
import { getTerms } from '@/api/ptt/term'
import { getOrgs } from '@/api/ptt/org'
import { getResourceTypes } from '@/api/ptt/resourceType'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = {
  id: null,
  term: { id: null },
  dept: { id: null },
  resourceType: { id: null },
  nullable: false,
  status: null,
  remark: null
}
export default {
  name: 'TermResourceType',
  components: { crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({ title: '套餐资源类型', url: 'api/ptt/termResourceType', crudMethod: { ...crudDept }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      rules: {
      },
      permission: {
        add: ['admin', 'termResourceType:add'],
        edit: ['admin', 'termResourceType:edit'],
        del: ['admin', 'termResourceType:del']
      },
      terms: [],
      orgs: [],
      resourceTypes: []
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getTerms()
      this.getOrgs()
      if (form.id != null) {
        if (form.term == null) {
          form.term = { id: null }
        }
        if (form.dept == null) {
          form.dept = { id: null }
        }
        if (form.resourceType == null) {
          form.resourceType = { id: null }
        }
        if (form.dept.id != null) {
          this.getResourceTypes(form.dept.id)
        }
      } else {
        form.term.id = null
        form.dept.id = null
        form.resourceType.id = null
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      return true
    },
    getTerms() {
      getTerms({ isPaged: false }).then(res => {
        this.terms = res.content
      })
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

