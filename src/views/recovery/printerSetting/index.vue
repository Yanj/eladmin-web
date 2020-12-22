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
          <el-form-item label="名称">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="协议">
            <el-input v-model="form.protocol" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="机构id">
            <el-input v-model="form.orgId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="部门id">
            <el-input v-model="form.deptId" style="width: 370px;" />
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
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="protocol" label="协议" />
        <el-table-column prop="orgId" label="机构id" />
        <el-table-column prop="deptId" label="部门id" />
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
        <el-table-column v-permission="['admin','rcvPrinterSetting:edit','rcvPrinterSetting:del']" label="操作" width="150px" align="center">
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
import crudRcvPrinterSetting from '@/api/recovery/rcvPrinterSetting'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, address: null, protocol: null, orgId: null, deptId: null, status: null, remark: null }
export default {
  name: 'RcvPrinterSetting',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '打印机设置', url: 'api/recovery/rcvPrinterSetting', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvPrinterSetting }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvPrinterSetting:add'],
        edit: ['admin', 'rcvPrinterSetting:edit'],
        del: ['admin', 'rcvPrinterSetting:del']
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
