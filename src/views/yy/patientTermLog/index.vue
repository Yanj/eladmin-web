<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.patientTermId"
          clearable
          size="small"
          placeholder="输入患者套餐ID搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="患者套餐ID" prop="patientTerm.id">
          <el-input v-model="form.patientTerm.id" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="修改前" prop="before">
          <el-input v-model="form.before" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="修改后" prop="after">
          <el-input v-model="form.after" style="width: 370px;" />
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
      <el-table-column label="患者套餐ID" prop="patientTerm.id" />
      <el-table-column label="内容" prop="content" />
      <el-table-column label="类型" prop="type" />
      <el-table-column label="修改前" prop="before" />
      <el-table-column label="修改后" prop="after" />
      <el-table-column v-permission="['admin','patientTermLog:edit','patientTermLog:del']" label="操作" width="130px" align="center" fixed="right">
        <template slot-scope="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
            msg="确定删除吗?"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudApi from '@/api/yy/patientTermLog'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = {
  id: null,
  patientTerm: { id: null },
  content: null,
  type: null,
  before: null,
  after: null
}
export default {
  name: 'PatientTermLog',
  components: { crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({
      title: '患者套餐日志管理',
      url: 'api/yy/patientTermLog',
      query: { patientTermId: this.patientTermId },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  props: {
    patientTermId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      rules: {
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请输入类型', trigger: 'blur' }
        ],
        before: [
          { required: true, message: '请输入修改前的值', trigger: 'blur' }
        ],
        after: [
          { required: true, message: '请输入修改后的值', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'patientTermLog:add'],
        edit: ['admin', 'patientTermLog:edit'],
        del: ['admin', 'patientTermLog:del']
      }
    }
  },
  watch: {
    patientTermId: function(val) {
      if (val) {
        this.query.patientTermId = val
        this.crud.toQuery()
      }
    }
  },
  methods: {
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>

