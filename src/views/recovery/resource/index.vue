<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="编码">
            <el-input v-model="form.code" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="form.type.id"
              placeholder="请选择"
            >
              <el-option
                v-for="item in resourceTypes"
                :key="item.name"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
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
        <el-table-column prop="org.name" label="机构" />
        <el-table-column prop="dept.name" label="部门" />
        <el-table-column prop="type.name" label="类型" />
        <el-table-column prop="code" label="编码" />
        <el-table-column prop="name" label="名称" />
        <el-table-column v-permission="['admin','rcvResource:edit','rcvResource:del']" label="操作" width="150px" align="center">
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
import crudRcvResource from '@/api/recovery/rcvResource'
import { getResourceTypes } from '@/api/recovery/rcvResourceType'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { type: { id: null }, code: null, name: null }
export default {
  name: 'RcvResource',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '资源', url: 'api/recovery/rcvResource', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvResource }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvResource:add'],
        edit: ['admin', 'rcvResource:edit'],
        del: ['admin', 'rcvResource:del']
      },
      rules: {
        id: [
          { required: true, message: 'id不能为空', trigger: 'blur' }
        ]
      },
      resourceTypes: [],
      resourceType: ''
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getResourceTypes()
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud) {
      if (!crud.form.type.id) {
        this.$message({
          message: '类型不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },
    // 获取资源类型
    getResourceTypes() {
      getResourceTypes({}).then(res => {
        this.resourceTypes = res
      })
    }
  }
}
</script>

<style scoped>

</style>
