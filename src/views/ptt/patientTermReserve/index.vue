<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable size="small" placeholder="输入患者名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission">
        <template v-slot:right>
          <el-button
            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            :disabled="crud.selections.length !== 1"
            @click="checkIn(crud.selections[0])"
          >签到</el-button>
          <el-button
            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-data-line"
            :disabled="crud.selections.length !== 1"
            @click="verify(crud.selections[0])"
          >核销</el-button>
          <el-button
            class="filter-item"
            size="mini"
            type="danger"
            icon="el-icon-data-line"
            :disabled="crud.selections.length !== 1"
            @click="cancel(crud.selections[0])"
          >取消</el-button>
        </template>
      </crudOperation>
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="患者套餐" prop="patientTerm.id">
          <el-input v-model="form.patientTerm.id" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="医院" prop="dept.id">
          <el-input v-model="form.dept.id" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="预约日期" prop="date">
          <el-input v-model="form.date" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="开始时间" prop="beginTime">
          <el-input v-model="form.beginTime" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-input v-model="form.endTime" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="实际开始时间" prop="actualBeginTime">
          <el-input v-model="form.actualBeginTime" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="实际结束时间" prop="actualEndTime">
          <el-input v-model="form.actualEndTime" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-input v-model="form.status" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" style="width: 370px;" />
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
      <el-table-column label="患者" prop="patientTerm.patient.name" />
      <el-table-column label="套餐" prop="patientTerm.termName" />
      <el-table-column label="医院" prop="dept.name" />
      <el-table-column label="预约日期" prop="date">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" prop="beginTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" prop="endTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际开始时间" prop="actualBeginTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际结束时间" prop="actualEndTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status === '0'">已预约</span>
          <span v-else-if="scope.row.status === '1'">已签到</span>
          <span v-else-if="scope.row.status === '2'">已核销</span>
          <span v-else-if="scope.row.status === '3'">已取消</span>
        </template>
      </el-table-column>
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
import crudApi from '@/api/ptt/patientTermReserve'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = {
  id: null,
  patientTerm: { id: null },
  dept: { id: null },
  date: null,
  beginTime: null,
  endTime: null,
  actualBeginTime: null,
  actualEndTime: null,
  status: null,
  remark: null
}
export default {
  name: 'PatientTermReserve',
  components: { crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({ title: '患者预约管理', url: 'api/ptt/patientTermReserve', crudMethod: { ...crudApi }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 设置数据字典
  dicts: [],
  data() {
    return {
      depts: [],
      rules: {
        date: [
          { required: true, message: '请输入预约日期', trigger: 'blur' }
        ],
        beginTime: [
          { required: true, message: '请输入开始时间', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '请输入结束时间', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请输入状态', trigger: 'blur' }
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
    checkIn(val) {
      const id = val.id
      crudApi.checkIn({ id }).then(res => {
        this.crud.notify('签到成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        this.update(id)
      })
    },
    verify(val) {
      console.log(val)
      console.log(val.id)
    },
    cancel(val) {
      console.log(val)
      console.log(val.id)
      const id = val.id
      crudApi.cancel({ id }).then(res => {
        this.crud.notify('取消成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        this.update(id)
      })
    },
    update(id) {
      crudApi.get(id).then(res => {
        console.log(res)
        for (let i = 0; i < this.crud.data.length; i++) {
          if (res.id === this.crud.data[i].id) {
            this.crud.data[i] = res
            break
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>

