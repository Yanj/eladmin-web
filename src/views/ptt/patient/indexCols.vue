<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="名称">
          {{ form.title }}
        </el-form-item>
        <el-form-item label="值">
          <el-input v-if="form.type==='text'" v-model="form.value" style="width: 370px;" />
          <el-select v-if="form.type==='dict'" v-model="form.dictDetail.id" @change="handleDictDetailChange">
            <el-option
              v-for="item in form.cus.dict.dictDetails"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
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
      <el-table-column label="名称" prop="cus.title" />
      <el-table-column label="值" prop="value" />
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
  </div>
</template>

<script>
import crudApi from '@/api/ptt/patientWithCus'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = {
  deptId: null,
  patientId: null,
  cusId: null,
  type: 'text',
  value: null,
  dictDetail: {
    id: null
  },
  title: ''
}
export default {
  name: 'Patient',
  components: { crudOperation, udOperation },
  cruds() {
    return CRUD({
      title: '患者自定义',
      url: 'api/ptt/patient/fullCols',
      query: { deptId: null, patientId: null },
      crudMethod: { ...crudApi },
      queryOnPresenterCreated: false,
      sort: ['sort,asc'],
      optShow: {
        add: false,
        edit: true,
        del: false,
        download: false,
        reset: false
      }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 设置数据字典
  dicts: [''],
  data() {
    return {
      depts: [],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'patient:add'],
        edit: ['admin', 'patient:edit'],
        del: ['admin', 'patient:del']
      }
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      form.title = form.cus.title
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      console.log(this.form)
      return true
    },
    handleDictDetailChange(val) {
      let detail = null
      for (const index in this.form.cus.dict.dictDetails) {
        if (this.form.cus.dict.dictDetails[index].id === val) {
          detail = this.form.cus.dict.dictDetails[index]
          break
        }
      }
      console.log('-----')
      console.log(detail)
      if (detail != null) {
        this.form.value = detail.label
      }
    }
  }
}
</script>

<style scoped>

</style>

