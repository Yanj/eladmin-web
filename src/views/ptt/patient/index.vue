<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable size="small" placeholder="输入患者名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="患者 id" prop="patientId">
          <el-input v-model="form.patientId" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="患者姓名" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="档案编号" prop="mrn">
          <el-input v-model="form.mrn" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="身份证" prop="certNo">
          <el-input v-model="form.certNo" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-input v-model="form.birthday" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="职业" prop="profession">
          <el-input v-model="form.profession" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="联系人" prop="contractName">
          <el-input v-model="form.contactName" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contractPhone">
          <el-input v-model="form.contactPhone" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="联系人关系" prop="contractRelation">
          <el-input v-model="form.contactRelation" style="width: 370px;" />
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
      <el-table-column label="患者 id" prop="patientId" />
      <el-table-column label="名称" prop="name" />
      <el-table-column label="档案编号" prop="mrn" />
      <el-table-column label="身份证" prop="certNo" />
      <el-table-column label="电话" prop="phone" />
      <el-table-column label="生日" prop="birthday" />
      <el-table-column label="职业" prop="profession" />
      <el-table-column label="地址" prop="address" />
      <el-table-column label="联系人" prop="contactName" />
      <el-table-column label="联系人电话" prop="contactPhone" />
      <el-table-column label="联系人关系" prop="contactRelation" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','patient:edit','patient:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudDept from '@/api/ptt/patient'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = { id: null, patientId: null, name: null, mrn: null, certNo: null, phone: null, birthday: null, profession: null, address: null, contactName: null, contactPhone: null, contactRelation: null, status: null }
export default {
  name: 'Patient',
  components: { crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({ title: '患者管理', url: 'api/ptt/patient', crudMethod: { ...crudDept }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 设置数据字典
  dicts: ['dept_status'],
  data() {
    return {
      depts: [],
      rules: {
        patientId: [
          { required: true, message: '请输入患者 id', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        mrn: [
          { required: true, message: '请输入档案编号', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
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

