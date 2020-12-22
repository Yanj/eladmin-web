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
          <el-form-item label="姓名">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="身份证">
            <el-input v-model="form.certNo" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="form.phone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="生日">
            <el-input v-model="form.birthday" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="职业">
            <el-input v-model="form.profession" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="form.contactName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.contactPhone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="联系人关系">
            <el-input v-model="form.contactRelation" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="col1">
            <el-input v-model="form.col1" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="col2">
            <el-input v-model="form.col2" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="col3">
            <el-input v-model="form.col3" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="col4">
            <el-input v-model="form.col4" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="col5">
            <el-input v-model="form.col5" style="width: 370px;" />
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
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="certNo" label="身份证" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="birthday" label="生日">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.birthday) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profession" label="职业" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="contactName" label="联系人" />
        <el-table-column prop="contactPhone" label="联系电话" />
        <el-table-column prop="contactRelation" label="联系人关系" />
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
        <el-table-column prop="col1" label="col1" />
        <el-table-column prop="col2" label="col2" />
        <el-table-column prop="col3" label="col3" />
        <el-table-column prop="col4" label="col4" />
        <el-table-column prop="col5" label="col5" />
        <el-table-column v-permission="['admin','rcvUser:edit','rcvUser:del']" label="操作" width="150px" align="center">
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
import crudRcvUser from '@/api/recovery/rcvUser'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, certNo: null, phone: null, birthday: null, profession: null, address: null, contactName: null, contactPhone: null, contactRelation: null, status: null, remark: null, col1: null, col2: null, col3: null, col4: null, col5: null }
export default {
  name: 'RcvUser',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '患者信息', url: 'api/recovery/rcvUser', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvUser }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvUser:add'],
        edit: ['admin', 'rcvUser:edit'],
        del: ['admin', 'rcvUser:del']
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
