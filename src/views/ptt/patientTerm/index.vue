<template>
  <div class="app-container">
    <div>
      <el-row :gutter="15">
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
          <el-card class="box-card" shadow="never">
            <patientList @patient-selection-change="handlePatientSelectionChange" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17">
          <el-card class="box-card" shadow="never">
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
                <el-form-item label="患者 id" prop="patientId">
                  <el-input v-model="form.patientId" style="width: 370px;" />
                </el-form-item>
                <el-form-item label="患者姓名" prop="name">
                  <el-input v-model="form.name" style="width: 370px;" />
                </el-form-item>
                <el-form-item label="档案编号" prop="mrn">
                  <el-input v-model="form.mrn" style="width: 370px;" />
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                  <el-input v-model="form.phone" style="width: 370px;" />
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
              <el-table-column label="患者" prop="patient.name" />
              <el-table-column label="套餐编码" prop="termCode" />
              <el-table-column label="套餐名称" prop="termName" />
              <el-table-column label="套餐描述" prop="termDescription" />
              <el-table-column label="套餐时长" prop="termDuration" />
              <el-table-column label="套餐次数" prop="termTimes" />
              <el-table-column label="套餐单位" prop="termUnit" />
              <el-table-column label="套餐单价" prop="termPrice" />
              <el-table-column label="套餐总价" prop="termAmount" />
              <el-table-column label="剩余次数" prop="times" />
              <el-table-column label="实际支付金额" prop="amount" />
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
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import crudApi from '@/api/ptt/patientTerm'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

import patientList from '@/views/ptt/patient/list'

const defaultForm = { id: null, patientId: null, name: null, mrn: null, certNo: null, phone: null, birthday: null, profession: null, address: null, contractName: null, contractPhone: null, contractRelation: null, status: null }
export default {
  name: 'PatientTerm',
  components: { crudOperation, rrOperation, udOperation, patientList },
  cruds() {
    return CRUD({
      title: '患者套餐管理',
      url: 'api/ptt/patientTerm',
      query: {
        patientId: null
      },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
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
    },
    handlePatientSelectionChange(val) {
      this.crud.query.patientId = val.id
      this.crud.toQuery()
    }
  }
}
</script>

<style scoped>

</style>

