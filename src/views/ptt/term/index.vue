<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable size="small" placeholder="输入套餐名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="时长" prop="duration">
          <el-input v-model="form.duration" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="次数" prop="times">
          <el-input v-model="form.times" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input v-model="form.price" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="总价" prop="amount">
          <el-input v-model="form.amount" style="width: 370px;" />
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
      <el-table-column :selectable="checkboxT" type="selection" width="55" />
      <el-table-column label="编码" prop="code" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="描述" prop="description" />
      <el-table-column label="时长" prop="duration" />
      <el-table-column label="次数" prop="times" />
      <el-table-column label="单位" prop="unit" />
      <el-table-column label="单价" prop="price">
        <template slot-scope="scope">
          <span>{{ parseMoney(scope.row.price) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总价" prop="amount">
        <template slot-scope="scope">
          <span>{{ parseMoney(scope.row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" />
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','term:edit','term:del']" label="操作" width="130px" align="center" fixed="right">
        <template slot-scope="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
            :disabled-dle="scope.row.id === 1"
            msg="确定删除吗?"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudDept from '@/api/ptt/term'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = { id: null, code: null, name: null, description: null, duration: 0, times: null, unit: null, price: null, amount: null, status: null, remark: null }
export default {
  name: 'Term',
  components: { crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({ title: '套餐管理', url: 'api/ptt/term', crudMethod: { ...crudDept }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      rules: {
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请输入时长', trigger: 'blur' }
        ],
        times: [
          { required: true, message: '请输入次数', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请输入单位', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入单价', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '请输入总价', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'term:add'],
        edit: ['admin', 'term:edit'],
        del: ['admin', 'term:del']
      }
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {

    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      return true
    },
    checkboxT(row, rowIndex) {
      return row.id !== 1
    }
  }
}
</script>

<style scoped>

</style>

