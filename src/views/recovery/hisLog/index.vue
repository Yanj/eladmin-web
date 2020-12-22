<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="项目购买ID" prop="patItemId">
            <el-input v-model="form.patItemId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="就诊ID">
            <el-input v-model="form.visitId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="患者ID">
            <el-input v-model="form.patientId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="患者姓名">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="患者电话">
            <el-input v-model="form.mobilePhone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="患者档案编号">
            <el-input v-model="form.mrn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="就诊科室">
            <el-input v-model="form.visitDept" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="就诊日期" prop="visitDate">
            <el-input v-model="form.visitDate" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="项目编码">
            <el-input v-model="form.itemCode" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input v-model="form.itemName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="单价">
            <el-input v-model="form.price" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="数量">
            <el-input v-model="form.amount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="form.unit" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="应收金额">
            <el-input v-model="form.costs" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="实收金额">
            <el-input v-model="form.actualCosts" style="width: 370px;" />
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
        <el-table-column prop="patItemId" label="项目购买ID" />
        <el-table-column prop="visitId" label="就诊ID" />
        <el-table-column prop="patientId" label="患者ID" />
        <el-table-column prop="name" label="患者姓名" />
        <el-table-column prop="mobilePhone" label="患者电话" />
        <el-table-column prop="mrn" label="患者档案编号" />
        <el-table-column prop="visitDept" label="就诊科室" />
        <el-table-column prop="visitDate" label="就诊日期">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.visitDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="itemCode" label="项目编码" />
        <el-table-column prop="itemName" label="项目名称" />
        <el-table-column prop="price" label="单价" />
        <el-table-column prop="amount" label="数量" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="costs" label="应收金额" />
        <el-table-column prop="actualCosts" label="实收金额" />
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
        <el-table-column v-permission="['admin','rcvHisLog:edit','rcvHisLog:del']" label="操作" width="150px" align="center">
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
import crudRcvHisLog from '@/api/recovery/rcvHisLog'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { patItemId: null, visitId: null, patientId: null, name: null, mobilePhone: null, mrn: null, visitDept: null, visitDate: null, itemCode: null, itemName: null, price: null, amount: null, unit: null, costs: null, actualCosts: null, remark: null }
export default {
  name: 'RcvHisLog',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'HIS查询日志', url: 'api/recovery/rcvHisLog', idField: 'patItemId', sort: 'patItemId,desc', crudMethod: { ...crudRcvHisLog }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvHisLog:add'],
        edit: ['admin', 'rcvHisLog:edit'],
        del: ['admin', 'rcvHisLog:del']
      },
      rules: {
        patItemId: [
          { required: true, message: '项目购买ID不能为空', trigger: 'blur' }
        ],
        visitDate: [
          { required: true, message: '就诊日期不能为空', trigger: 'blur' }
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
