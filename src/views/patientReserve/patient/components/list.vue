<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <template v-if="hasAdminPermission && !isPickerMode">
          <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
        </template>
        <el-select v-model="query.source" clearable size="small" placeholder="选择来源搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.patient_source" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <el-input v-model="query.blurry" clearable size="small" placeholder="患者名称/档案号/手机号搜索" style="width: 240px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-if="hasAdminPermission && !isPickerMode" v-model="query.status" clearable size="small" placeholder="选择状态搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.patient_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="550px">
      <el-form ref="form" inline :model="form" size="small" label-width="100px">
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择部门', trigger:'blur'}]" label="部门">
          <dept-picker v-model="formDept" width="370" :disabled="disableEdit" />
        </el-form-item>
        <el-form-item label="来源" prop="source">
          <el-select v-model="form.source" :disabled="disableEdit" style="width: 370px;" @change="handleSourceChange">
            <el-option v-for="item in dict.patient_source" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isSourceExternal" :rules="[{ required: true, message: '请输入外部系统ID', trigger: 'blur' }]" label="外部系统ID" prop="code">
          <el-input v-model="form.code" :disabled="disableEdit" style="width: 370px;" />
        </el-form-item>
        <el-form-item v-if="!isSourceExternal" :rules="[{ required: true, message: '请输入档案号', trigger: 'blur' }]" label="档案号" prop="mrn">
          <el-input v-model="form.mrn" :disabled="disableEdit" style="width: 370px;" />
        </el-form-item>
        <el-form-item :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]" label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' },{ type: 'string', len: 11, message: '请输入正确的手机号'}]" label="手机号" prop="phone">
          <el-input v-model="form.phone" style="width: 370px;" />
        </el-form-item>
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择状态', trigger:'blur'}]" label="状态" prop="status">
          <el-select v-model="form.status" style="width: 370px;">
            <el-option v-for="item in dict.patient_status" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" style="width: 370px;" />
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
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="hasAdminPermission" label="组织ID" prop="orgId" />
      <el-table-column v-if="hasAdminPermission" label="医院ID" prop="comId" />
      <el-table-column v-if="hasAdminPermission" label="部门ID" prop="deptId" />
      <el-table-column label="来源" prop="source" width="100">
        <template slot-scope="scope">
          {{ dict.label.patient_source[scope.row.source] }}
        </template>
      </el-table-column>
      <el-table-column label="外部系统ID" prop="code" width="100" />
      <el-table-column label="档案号" prop="mrn" width="100" />
      <el-table-column label="名称" prop="name" width="100" />
      <el-table-column label="手机号" prop="phone" width="100" />
      <el-table-column v-if="hasAdminPermission" label="状态" prop="status" width="100">
        <template slot-scope="scope">
          {{ dict.label.patient_status[scope.row.status] }}
        </template>
      </el-table-column>
      <el-table-column label="自定义1" prop="col1" />
      <el-table-column label="自定义2" prop="col2" />
      <el-table-column label="自定义3" prop="col3" />
      <el-table-column label="自定义4" prop="col4" />
      <el-table-column label="自定义5" prop="col5" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column v-if="!isPickerMode" v-permission="['admin','patient:edit','patient:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudApi from '@/api/patientReserve/patient'

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
  source: null,
  code: null,
  mrn: null,
  name: null,
  phone: null,
  status: null,
  remark: null,
  col1: null,
  col2: null,
  col3: null,
  col4: null,
  col5: null
}
const defaultSource = 'HIS'
export default {
  name: 'Patient',
  components: { crudOperation, rrOperation, udOperation, pagination, deptPicker },
  cruds() {
    return CRUD({
      title: '患者管理',
      url: 'api/yy/patient',
      query: { blurry: null, mrn: null, name: null, phone: null, source: null, orgId: null, comId: null, deptId: null, status: null },
      queryOnPresenterCreated: true,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud(), hasAdminPermission()],
  dicts: ['patient_source', 'patient_status'],
  props: {
    mode: {
      type: String,
      default: 'list' || 'picker'
    },
    comId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    const currentSource = defaultSource
    return {
      permission: {
        add: ['admin', 'patient:add'],
        edit: ['admin', 'patient:edit'],
        del: ['admin', 'patient:del']
      },
      currentSource: currentSource,
      disableEdit: false,
      formDept: {
        orgId: null,
        comId: null,
        deptId: null
      }
    }
  },
  computed: {
    isSourceExternal: function() {
      return this.currentSource !== defaultSource
    },
    isPickerMode: function() {
      return this.mode === 'picker'
    }
  },
  created() {
    if (this.isPickerMode) {
      this.crud.optShow = {
        add: false,
        edit: false,
        del: false,
        download: false,
        reset: false
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
    // 刷新之前
    [CRUD.HOOK.beforeRefresh](crud) {
      if (this.isPickerMode) {
        this.query.comId = this.comId
        this.query.status = '1'
      }
    },
    // 刷新之后
    [CRUD.HOOK.afterRefresh](crud) {
      this.$emit('after-refresh', crud)
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      if (!form.id) { // 新增
        form.source = defaultSource
        this.currentSource = defaultSource
        this.disableEdit = false
      } else { // 编辑
        this.currentSource = form.source
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
    // 表格选中监听
    handleSelectionChange(selection) {
      this.crud.selectionChangeHandler(selection)
      this.$emit('selection-change', selection)
    },
    // 行选中监听
    handleRowClick(row) {
      this.$refs['table'].toggleRowSelection(row)
    },
    setTableQuery(query) {
      console.log(query)
      this.query.orgId = query.orgId
      this.query.comId = query.comId
      this.query.deptId = query.deptId
      this.refreshTable()
    },
    // 刷新数据
    refreshTable() {
      this.crud.toQuery()
    },
    // 清空表格选中
    clearSelection() {
      this.$refs.table.clearSelection()
    },
    // 清空数据
    clear() {
      this.crud.data = []
    },
    // 来源改变
    handleSourceChange(v) {
      this.currentSource = v
    }
  }
}
</script>

<style scoped>

</style>
