<template>
  <div class="app-container">
    <!--工具栏-->
    <div v-show="showHeader" class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <hospital-picker
          :value="currentHospital"
          @change="handleHospitalChange"
        />
        <el-input v-model="query.blurry" clearable size="small" placeholder="输入患者名称/档案号/手机号进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="HIS系统ID" prop="code">
          <el-input v-model="form.code" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="档案号" prop="mrn">
          <el-input v-model="form.mrn" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义1" prop="col1">
          <el-input v-model="form.col1" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义2" prop="col2">
          <el-input v-model="form.col2" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义3" prop="col3">
          <el-input v-model="form.col3" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义4" prop="col4">
          <el-input v-model="form.col4" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义5" prop="col5">
          <el-input v-model="form.col5" style="width: 370px;" />
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
      highlight-current-row
      @select="crud.selectChange"
      @select-all="crud.selectAllChange"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="HIS系统ID" prop="code" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="档案号" prop="mrn" />
      <el-table-column label="电话" prop="phone" />
      <el-table-column label="自定义1" prop="col1" />
      <el-table-column label="自定义2" prop="col2" />
      <el-table-column label="自定义3" prop="col3" />
      <el-table-column label="自定义4" prop="col4" />
      <el-table-column label="自定义5" prop="col5" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column v-permission="['admin','patient:edit','patient:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudApi from '@/api/yy/queryPatient'
import hospitalPicker from '@/views/yy/hospital/hospitalPicker'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  code: null,
  patientId: null,
  deptId: null,
  name: null,
  mrn: null,
  phone: null,
  col1: null,
  col2: null,
  col3: null,
  col4: null,
  col5: null,
  status: null,
  remark: null
}
export default {
  name: 'QueryPatient',
  components: { crudOperation, rrOperation, udOperation, pagination, hospitalPicker },
  cruds() {
    return CRUD({
      title: '患者管理',
      url: 'api/yy/queryPatient',
      query: {
        deptId: null,
        blurry: null
      },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  props: {
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rules: {
        code: [
          { required: true, message: '请输入HIS系统ID', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        mrn: [
          { required: true, message: '请输入档案号', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'patient:add'],
        edit: ['admin', 'patient:edit'],
        del: ['admin', 'patient:del']
      },
      currentHospital: { id: null, name: null }
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      // 新增
      if (!form.id) {
        // 设置状态
        form.status = '1'
        // 设置部门
        form.deptId = this.currentHospital.id
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (!this.form.deptId) {
        this.$message({
          message: '所属医院不能为空',
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
    }
  }
}
</script>

<style scoped>
</style>

