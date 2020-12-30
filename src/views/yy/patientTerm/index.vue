<template>
  <div class="app-container">
    <!--工具栏-->
    <div v-show="showHeader" class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable size="small" placeholder="输入套餐名称/编码进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-input v-model="query.patientName" clearable size="small" placeholder="输入患者名称进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="患者">
          <el-autocomplete
            v-model="currentPatientName"
            popper-class="my-autocomplete"
            :fetch-suggestions="querySearch"
            style="width: 370px;"
            placeholder="请输入患者名称"
            @select="handlePatientSelect"
          >
            <i
              slot="suffix"
              class="el-icon-circle-close el-input__icon"
              @click="handleClearPatient"
            />
            <template slot-scope="{ item }">
              <div class="name">{{ item.name }}</div>
              <span class="mrn">{{ item.mrn }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="套餐">
          <term-picker
            :value="currentTerm"
            @change="handleTermChange"
          />
        </el-form-item>
        <el-form-item label="套餐编码" prop="termCode">
          <el-input v-model="form.termCode" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐名称" prop="termName">
          <el-input v-model="form.termName" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐现价" prop="termPrice">
          <el-input v-model="form.termPrice" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐原价" prop="termOriginalPrice">
          <el-input v-model="form.termOriginalPrice" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐次数" prop="termTimes">
          <el-input v-model="form.termTimes" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="套餐单位" prop="termUnit">
          <el-input v-model="form.termUnit" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="实际支付" prop="price">
          <el-input v-model="form.price" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="剩余次数" prop="times">
          <el-input v-model="form.times" style="width: 370px;" />
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
      highlight-current-row
      @select="crud.selectChange"
      @select-all="crud.selectAllChange"
      @selection-change="crud.selectionChangeHandler"
      @current-change="handleCurrentChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="患者" prop="patient.name" />
      <el-table-column label="套餐编码" prop="termCode" />
      <el-table-column label="套餐名称" prop="termName" />
      <el-table-column label="套餐现价" prop="termPrice">
        <template slot-scope="scope">
          {{ parseMoney(scope.row.termPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="套餐原价" prop="termOriginalPrice">
        <template slot-scope="scope">
          {{ parseMoney(scope.row.termOriginalPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="套餐次数" prop="termTimes" />
      <el-table-column label="套餐单位" prop="termUnit" />
      <el-table-column label="实际支付" prop="price">
        <template slot-scope="scope">
          {{ parseMoney(scope.row.price) }}
        </template>
      </el-table-column>
      <el-table-column label="剩余次数" prop="times" />
      <el-table-column label="状态" prop="status" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column v-permission="['admin','patientTerm:edit','patientTerm:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudApi from '@/api/yy/patientTerm'
import { getAllPatient } from '@/api/yy/patient'
import termPicker from '@/views/yy/term/termPicker'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  patient: { id: null, name: null },
  termCode: null,
  termName: null,
  termPrice: null,
  termOriginalPrice: null,
  termTimes: null,
  termUnit: null,
  price: null,
  times: null,
  status: null,
  remark: null
}
export default {
  name: 'PatientTerm',
  components: { crudOperation, rrOperation, udOperation, pagination, termPicker },
  cruds() {
    return CRUD({
      title: '患者套餐管理',
      url: 'api/yy/patientTerm',
      query: {
        blurry: null,
        patientName: null,
        patientId: null
      },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  props: {
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rules: {
        termCode: [
          { required: true, message: '请输入套餐编码', trigger: 'blur' }
        ],
        termName: [
          { required: true, message: '请输入套餐名称', trigger: 'blur' }
        ],
        termPrice: [
          { required: true, message: '请输入套餐价格', trigger: 'blur' }
        ],
        termOriginalPrice: [
          { required: true, message: '请输入套餐原价', trigger: 'blur' }
        ],
        termTimes: [
          { required: true, message: '请输入套餐次数', trigger: 'blur' }
        ],
        termUnit: [
          { required: true, message: '请输入套餐单位', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入实际支付金额', trigger: 'blur' }
        ],
        times: [
          { required: true, message: '请输入剩余次数', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'patientTerm:add'],
        edit: ['admin', 'patientTerm:edit'],
        del: ['admin', 'patientTerm:del']
      },
      patients: [],
      currentPatientName: '',
      currentTerm: { id: null }
    }
  },
  created() {
    if (this.showHeader) {
      setTimeout(() => {
        this.crud.toQuery()
      }, 500)
    }
  },
  mounted() {
    // 加载全部患者
    this.getAllPatient()
  },
  methods: {
    // 刷新之后
    [CRUD.HOOK.afterRefresh](crud) {
      this.$emit('after-refresh', crud)
    },
    // 开始 "新建/编辑" - 之前
    [CRUD.HOOK.afterToCU](crud, form) {
      if (form.id == null) {
        form.patient = { id: null, name: null }
        this.currentPatientName = ''
      } else {
        this.currentPatientName = form.patient.name
      }
      this.currentTerm = { id: null }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.patient === null || this.form.patient.id === null) {
        this.$message({
          message: '患者不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },
    // 加载全部患者
    getAllPatient() {
      getAllPatient().then(res => {
        if (res) {
          this.patients = res
        }
      })
    },
    querySearch(queryString, cb) {
      console.log(this.patients)
      const patients = this.patients
      const result = queryString ? patients.filter(this.createFilter(queryString)) : patients
      console.log(result)
      cb(result)
    },
    createFilter(queryString) {
      return (patient) => {
        return (patient.name.indexOf(queryString) === 0)
      }
    },
    handlePatientSelect(item) {
      this.form.patient = item
      this.currentPatientName = item.name
    },
    handleClearPatient() {
      this.form.patient = null
      this.currentPatientName = null
    },
    handleTermChange(val) {
      this.currentTerm = val
      this.form.termCode = val.code
      this.form.termName = val.name
      this.form.termPrice = val.price
      this.form.termOriginalPrice = val.originalPrice
      this.form.termTimes = val.times
      this.form.termUnit = val.unit
    },
    // 处理列表选中改变事件
    handleCurrentChange(row) {
      if (row) {
        this.$emit('current-change', row)
      }
    },
    // 清空表格选中
    clearSelection() {
      this.$refs.table.clearSelection()
    },
    // 清空数据
    clear() {
      this.crud.data = []
    },
    // 根据套餐编码设置选中行
    setCurrentRowByTermCode(termCode) {
      for (let i = 0; i < this.crud.data.length; i++) {
        if (this.crud.data[i].termCode === termCode) {
          this.$refs.table.setCurrentRow(this.crud.data[i])
          break
        }
      }
    },
    // 根据 id 刷新数据
    refreshRowById(id) {
      crudApi.getById(id).then(res => {
        console.log(res)
        for (let i = 0; i < this.crud.data.length; i++) {
          console.log(this.crud.data[i])
          if (res.id === this.crud.data[i].id) {
            // 更新数量
            this.crud.data[i].times = res.times
            break
          }
        }
      })
    }
  }
}
</script>

<style>
.my-autocomplete li {
  line-height: normal;
  padding: 7px;
}
.my-autocomplete li .name {
  text-overflow: ellipsis;
  overflow: hidden;
}
.my-autocomplete li .mrn {
  font-size: 12px;
  color: #b4b4b4;
}
.my-autocomplete li .highlighted .mrn {
  color: #ddd;
}
</style>

