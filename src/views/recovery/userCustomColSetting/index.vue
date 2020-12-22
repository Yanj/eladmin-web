<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="机构">
            <el-select v-model="form.org.id" placeholder="请选择" @change="loadDepts">
              <el-option v-for="item in orgs" :key="item.name" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="部门">
            <el-select v-model="form.dept.id" placeholder="请选择">
              <el-option v-for="item in depts" :key="item.name" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="列名称">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="列描述">
            <el-input v-model="form.description" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="字典">
            <el-select v-model="form.dict.id" placeholder="请选择">
              <el-option v-for="item in dicts" :key="item.name" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-input v-model="form.status" style="width: 370px;" />
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
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="id" />
        <el-table-column prop="org.name" label="机构" />
        <el-table-column prop="dept.name" label="部门" />
        <el-table-column prop="name" label="列名称" />
        <el-table-column prop="description" label="列描述" />
        <el-table-column prop="dict.name" label="字典" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column v-permission="['admin','rcvUserCustomColSetting:edit','rcvUserCustomColSetting:del']" label="操作" width="150px" align="center">
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
  </div>
</template>

<script>
import crudRcvUserCustomColSetting from '@/api/recovery/rcvUserCustomColSetting'
import rcvOrg from '@/api/recovery/rcvOrg'
import rcvDept from '@/api/recovery/rcvDept'
import { getDicts } from '@/api/system/dict'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null, name: null, description: null, status: null, remark: null,
  org: { id: null }, dept: { id: null }, dict: { id: null }
}
export default {
  name: 'RcvUserCustomColSetting',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '用户自定义列设置', url: 'api/recovery/rcvUserCustomColSetting', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvUserCustomColSetting }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvUserCustomColSetting:add'],
        edit: ['admin', 'rcvUserCustomColSetting:edit'],
        del: ['admin', 'rcvUserCustomColSetting:del']
      },
      rules: {
        name: [
          { required: true, message: '列名称不能为空', trigger: 'blur' }
        ]
      },
      orgs: [],
      depts: [],
      dicts: []
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      // 加载机构
      this.loadOrgs()
      // 加载字典
      this.loadDicts()
    },
    // 加载机构
    loadOrgs() {
      const params = {}
      setTimeout(() => {
        rcvOrg.getOrgs(params).then(res => {
          this.orgs = res
        })
      }, 100)
    },
    // 加载部门
    loadDepts(value) {
      const params = { orgId: value }
      setTimeout(() => {
        rcvDept.getDepts(params).then(res => {
          this.depts = res
        })
      }, 100)
    },
    // 加载字典
    loadDicts() {
      getDicts().then(data => {
        this.dicts = data
      })
    }
  }
}
</script>

<style scoped>

</style>
