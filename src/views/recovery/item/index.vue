<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="id" prop="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐编码">
            <el-input v-model="form.code" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐名称">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="单价">
            <el-input v-model="form.price" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="次数">
            <el-input v-model="form.times" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="form.unit" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="总价">
            <el-input v-model="form.amount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" style="width: 370px;" />
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
        <el-table-column prop="id" label="id" />
        <el-table-column prop="code" label="套餐编码" />
        <el-table-column prop="name" label="套餐名称" />
        <el-table-column prop="price" label="单价" />
        <el-table-column prop="times" label="次数" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="amount" label="总价" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="createBy" label="创建人" />
        <el-table-column prop="updatedBy" label="修改人" />
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="修改时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column v-permission="['admin','rcvItem:edit','rcvItem:del']" label="操作" width="150px" align="center">
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
import crudRcvItem from '@/api/recovery/rcvItem'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, code: null, name: null, price: null, times: null, unit: null, amount: null, status: null, remark: null }
export default {
  name: 'RcvItem',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '套餐', url: 'api/recovery/rcvItem', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvItem }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvItem:add'],
        edit: ['admin', 'rcvItem:edit'],
        del: ['admin', 'rcvItem:del']
      },
      rules: {
        id: [
          { required: true, message: 'id不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
