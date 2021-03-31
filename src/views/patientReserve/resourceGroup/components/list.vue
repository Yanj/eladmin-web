<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
        <el-input v-model="query.blurry" clearable size="small" placeholder="名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-if="hasAdminPermission" v-model="query.status" clearable size="small" placeholder="选择状态搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.resource_group_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择部门', trigger:'blur'}]" label="部门">
          <dept-picker v-model="formDept" width="370" :disabled="disableEdit" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择状态', trigger:'blur'}]" label="状态" prop="status">
          <el-select v-model="form.status" style="width: 370px;">
            <el-option v-for="item in dict.resource_group_status" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--表格组件-->
    <el-row :gutter="10">
      <el-col :span="hasRight ? 16 : 24">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">资源分组列表</span>
          </div>
          <!--表格渲染-->
          <el-table
            ref="table"
            v-loading="crud.loading"
            highlight-current-row
            :data="crud.data"
            row-key="id"
            @select="crud.selectChange"
            @select-all="crud.selectAllChange"
            @selection-change="crud.selectionChangeHandler"
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column v-if="hasAdminPermission" label="组织ID" prop="orgId" width="60" />
            <el-table-column v-if="hasAdminPermission" label="医院ID" prop="comId" width="60" />
            <el-table-column v-if="hasAdminPermission" label="部门ID" prop="deptId" width="60" />
            <el-table-column label="名称" prop="name" width="250" />
            <el-table-column v-if="hasAdminPermission" label="状态" prop="status" width="50">
              <template slot-scope="scope">
                {{ dict.label.resource_group_status[scope.row.status] }}
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" width="50" />
            <el-table-column v-permission="['admin','resourceGroup:edit','resourceGroup:del']" label="操作" width="130px" align="center" fixed="right">
              <template slot-scope="scope">
                <udOperation
                  :data="scope.row"
                  :permission="permission"
                  msg="确定删除吗?"
                />
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </el-card>
      </el-col>
      <el-col v-if="hasRight" :span="8">
        <slot name="right" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudApi from '@/api/patientReserve/resourceGroup'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

const defaultForm = {
  id: null,
  orgId: null,
  comId: null,
  deptId: null,
  name: '',
  status: null,
  remark: null
}
export default {
  name: 'ResourceGroupList',
  components: { crudOperation, rrOperation, udOperation, pagination, deptPicker },
  cruds() {
    return CRUD({
      title: '资源分组管理',
      url: 'api/yy/resourceGroup',
      query: { blurry: null, status: null, orgId: null, comId: null, deptId: null },
      queryOnPresenterCreated: true,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud(), hasAdminPermission()],
  dicts: ['resource_group_status'],
  props: {
    hasRight: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rules: {
        name: [
          { required: true, message: '请输入分组名称', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'resourceGroup:add'],
        edit: ['admin', 'resourceGroup:edit'],
        del: ['admin', 'resourceGroup:del'],
        editResourceCategory: ['admin', 'resourceGroup:editResourceCategory']
      },
      disableEdit: false,
      formDept: {
        orgId: null,
        comId: null,
        deptId: null
      }
    }
  },
  methods: {
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.crud.toQuery()
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      if (!form.id) { // 新增
        this.disableEdit = false
      } else { // 编辑
        this.disableEdit = true
      }
      this.formDept = {
        orgId: form.orgId,
        comId: form.comId,
        deptId: form.deptId
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      this.form.orgId = this.formDept.orgId
      this.form.comId = this.formDept.comId
      this.form.deptId = this.formDept.deptId
      return true
    },
    // 刷新之后
    [CRUD.HOOK.afterRefresh](crud) {
      this.$emit('after-refresh', crud.page.page === 1)
    },
    handleCurrentChange(val) {
      this.$emit('current-change', val)
    },
    // 保存分类
    saveResourceCategory(obj, callback) {
      const resourceGroup = { id: obj.id, resourceCategories: [] }
      // 得到已选中的 key 值
      obj.resourceCategoryIds.forEach(function(id) {
        const resourceCategory = { id: id }
        resourceGroup.resourceCategories.push(resourceCategory)
      })
      crudApi.editResourceCategory(resourceGroup).then(() => {
        this.crud.notify('保存成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        if (callback) {
          callback(true)
        }
        this.update(obj.id)
      }).catch(err => {
        if (callback) {
          callback(false)
        }
        console.log(err.response.data.message)
      })
    },
    // 改变数据
    update(id) {
      // 无刷新更新 表格数据
      crudApi.get(id).then(res => {
        for (let i = 0; i < this.crud.data.length; i++) {
          if (res.id === this.crud.data[i].id) {
            this.crud.data[i] = res
            break
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
