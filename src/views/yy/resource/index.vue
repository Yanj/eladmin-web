<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <hospital-picker
          :value="currentHospital"
          @change="handleHospitalChange"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="医院">
          <hospital-picker :value="form.dept" :disabled="true" />
        </el-form-item>
        <el-form-item label="分类">
          <resource-category-picker
            :value.sync="form.resourceCategory"
            :dept-id="currentHospital.id"
            @change="handleCategoryChange"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="数量" prop="count">
          <el-input v-model="form.count" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-input v-model="form.status" style="width: 370px;" />
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
      <el-table-column label="分类" prop="resourceCategory.name" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="数量" prop="count" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column v-permission="['admin','resource:edit','resource:del']" label="操作" width="130px" align="center" fixed="right">
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
  </div>
</template>

<script>
import crudApi from '@/api/yy/resource'
import hospitalPicker from '@/views/yy/hospital/hospitalPicker'
import resourceCategoryPicker from '@/views/yy/resourceCategory/resourceCategoryPicker'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  dept: { id: null },
  resourceCategory: { id: null },
  name: '',
  count: 0,
  status: null,
  remark: null
}
export default {
  name: 'Resource',
  components: { crudOperation, rrOperation, udOperation, pagination, hospitalPicker, resourceCategoryPicker },
  cruds() {
    return CRUD({
      title: '资源管理',
      url: 'api/yy/resource',
      query: {
        deptId: null
      },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      rules: {
        name: [
          { required: true, message: '请输入资源名称', trigger: 'blur' }
        ],
        count: [
          { required: true, message: '请输入资源数量', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'resource:add'],
        edit: ['admin', 'resource:edit'],
        del: ['admin', 'resource:del']
      },
      currentHospital: { id: null }
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      form.dept = this.currentHospital
      if (form.id == null) {
        form.resourceCategory = { id: null }
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.dept === null || this.form.dept.id === null) {
        this.form.dept = this.currentHospital
      }
      if (this.form.dept === null || this.form.dept.id === null) {
        this.$message({
          message: '所属医院不能为空',
          type: 'warning'
        })
        return false
      }
      if (this.form.resourceCategory === null || this.form.resourceCategory.id === null) {
        this.$message({
          message: '资源分类不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },
    handleHospitalChange(val) {
      this.currentHospital = val
      this.query.deptId = val.id
      this.crud.toQuery()
    },
    handleCategoryChange(val) {
      this.form.resourceCategory = val
    }
  }
}
</script>

<style scoped>

</style>

