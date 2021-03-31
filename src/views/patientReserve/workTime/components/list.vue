<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
        <el-select v-if="hasAdminPermission" v-model="query.status" clearable size="small" placeholder="选择状态搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.work_time_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="550px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="100px">
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择部门', trigger:'blur'}]" label="部门">
          <dept-picker v-model="formDept" width="370" :disabled="disableEdit" />
        </el-form-item>
        <el-form-item label="开始时间" prop="beginTime">
          <el-time-select
            v-model="form.beginTime"
            placeholder="开始时间"
            :picker-options="{
              start: '09:00',
              step: '00:10',
              end: '18:00'
            }"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-select
            v-model="form.endTime"
            placeholder="结束时间"
            :picker-options="{
              start: '09:00',
              step: '00:10',
              end: '18:00'
            }"
            style="width: 370px;"
          />
        </el-form-item>
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择状态', trigger:'blur'}]" label="状态" prop="status">
          <el-select v-model="form.status" style="width: 370px;">
            <el-option v-for="item in dict.work_time_status" :key="item.id" :label="item.label" :value="item.value" />
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
      <el-table-column v-if="hasAdminPermission" label="组织ID" prop="orgId" />
      <el-table-column v-if="hasAdminPermission" label="医院ID" prop="comId" />
      <el-table-column v-if="hasAdminPermission" label="部门ID" prop="deptId" />
      <el-table-column label="开始时间" prop="beginTime" />
      <el-table-column label="结束时间" prop="endTime" />
      <el-table-column label="时长(分钟)" prop="duration" />
      <el-table-column v-if="hasAdminPermission" label="状态" prop="status" width="100">
        <template slot-scope="scope">
          {{ dict.label.work_time_status[scope.row.status] }}
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" />
      <el-table-column v-permission="['admin','workTime:edit','workTime:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudApi from '@/api/patientReserve/workTime'

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
  beginTime: '',
  endTime: '',
  status: null,
  remark: null
}
export default {
  name: 'WorkTimeList',
  components: { crudOperation, rrOperation, udOperation, pagination, deptPicker },
  cruds() {
    return CRUD({
      title: '工作时间管理',
      url: 'api/yy/workTime',
      queryOnPresenterCreated: true,
      query: {
        orgId: null,
        comId: null,
        deptId: null,
        status: null
      },
      sort: ['beginTime,asc'],
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud(), hasAdminPermission()],
  dicts: ['work_time_status'],
  data() {
    return {
      rules: {
        beginTime: [
          { required: true, message: '请输入开始时间', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '请输入结束时间', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'workTime:add'],
        edit: ['admin', 'workTime:edit'],
        del: ['admin', 'workTime:del']
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
      console.log(this.form)
      if (this.form.beginTime >= this.form.endTime) {
        this.$message({
          message: '开始时间必须大于结束时间',
          type: 'warning'
        })
        return false
      }
      this.form.orgId = this.formDept.orgId
      this.form.comId = this.formDept.comId
      this.form.deptId = this.formDept.deptId
      return true
    },
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.crud.toQuery()
    }
  }
}
</script>

<style scoped>

</style>
