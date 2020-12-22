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
          <el-form-item label="用户ID">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐ID">
            <el-input v-model="form.itemId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐编码">
            <el-input v-model="form.itemCode" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐名称">
            <el-input v-model="form.itemName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐单价">
            <el-input v-model="form.itemPrice" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐次数">
            <el-input v-model="form.itemTimes" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐单位">
            <el-input v-model="form.itemUnit" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="套餐总价">
            <el-input v-model="form.itemAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="实际支付">
            <el-input v-model="form.amount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="剩余次数">
            <el-input v-model="form.times" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="上次预约机构">
            <el-input v-model="form.orgId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="上次预约部门">
            <el-input v-model="form.deptId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="上次预约日期">
            <el-input v-model="form.reserveDate" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="机构变更次数">
            <el-input v-model="form.orgChangeCount" style="width: 370px;" />
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
        <el-table-column prop="userId" label="用户ID" />
        <el-table-column prop="itemId" label="套餐ID" />
        <el-table-column prop="itemCode" label="套餐编码" />
        <el-table-column prop="itemName" label="套餐名称" />
        <el-table-column prop="itemPrice" label="套餐单价" />
        <el-table-column prop="itemTimes" label="套餐次数" />
        <el-table-column prop="itemUnit" label="套餐单位" />
        <el-table-column prop="itemAmount" label="套餐总价" />
        <el-table-column prop="amount" label="实际支付" />
        <el-table-column prop="times" label="剩余次数" />
        <el-table-column prop="orgId" label="上次预约机构" />
        <el-table-column prop="deptId" label="上次预约部门" />
        <el-table-column prop="reserveDate" label="上次预约日期">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.reserveDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orgChangeCount" label="机构变更次数" />
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
        <el-table-column v-permission="['admin','rcvUserItem:edit','rcvUserItem:del']" label="操作" width="150px" align="center">
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
import crudRcvUserItem from '@/api/recovery/rcvUserItem'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, userId: null, itemId: null, itemCode: null, itemName: null, itemPrice: null, itemTimes: null, itemUnit: null, itemAmount: null, amount: null, times: null, orgId: null, deptId: null, reserveDate: null, orgChangeCount: null, status: null, remark: null }
export default {
  name: 'RcvUserItem',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '用户套餐', url: 'api/recovery/rcvUserItem', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvUserItem }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvUserItem:add'],
        edit: ['admin', 'rcvUserItem:edit'],
        del: ['admin', 'rcvUserItem:del']
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
