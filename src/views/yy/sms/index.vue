<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.mobile" clearable size="small" placeholder="输入手机号进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="业务ID" prop="busId">
          <el-input v-model="form.busId" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="业务类型" prop="busType">
          <el-input v-model="form.busType" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="结果" prop="status">
          <el-input v-model="form.status" style="width: 370px;" />
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
      <el-table-column label="ID" prop="id" />
      <el-table-column label="业务ID" prop="busId" />
      <el-table-column label="业务类型" prop="busType" />
      <el-table-column label="手机号" prop="mobile" />
      <el-table-column label="内容" prop="content" />
      <el-table-column label="结果" prop="status" />
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
import crudApi from '@/api/yy/sms'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  busId: null,
  busType: null,
  mobile: null,
  content: null,
  cell: null,
  status: null
}
export default {
  name: 'Sms',
  components: { crudOperation, rrOperation, udOperation, pagination },
  cruds() {
    return CRUD({
      title: '短信发送记录',
      url: 'api/yy/sms',
      queryOnPresenterCreated: true,
      query: {
        mobile: null
      },
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      rules: {
        busId: [
          { required: true, message: '请输入业务ID', trigger: 'blur' }
        ],
        busType: [
          { required: true, message: '请输入业务类型', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入短信内容', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请输入状态', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'sms:add'],
        edit: ['admin', 'sms:edit'],
        del: ['admin', 'sms:del']
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

