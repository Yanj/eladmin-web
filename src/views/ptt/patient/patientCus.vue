<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-select
          v-model="currentOrg"
          size="small"
          placeholder="请选择"
          style="width: 200px;"
          class="filter-item"
          value-key="id"
          @change="handleOrgChange"
        >
          <el-option v-for="org in orgs" :key="org.id" :label="org.name" :value="org">{{ org.name }}</el-option>
        </el-select>
        <el-input v-model="query.blurry" clearable placeholder="输入名称搜索" style="width: 200px" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="120px">
        <el-form-item label="医院">
          <el-select v-model="currentOrg.id" placeholder="请选择" :disabled="true" style="width:200px;">
            <el-option v-for="item in orgs" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="患者">
          <el-input v-model="form.name" style="width:200px;" :disabled="true" />
        </el-form-item>
        <el-form-item v-for="(cusCol, index) in cusCols" :key="index" :label="cusCol.title">
          <formCus :type="cusCol.type" :dict-map="dictMap" :dict="cusCol.dict" :value="form.colList[index]" @change="form.colList[index]=$event" />
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
      <el-table-column label="医院">{{ currentOrg.name || '' }}</el-table-column>
      <el-table-column label="名称" prop="name" />
      <el-table-column label="档案号" prop="mrn" />
      <el-table-column label="手机号" prop="phone" />
      <el-table-column v-for="col in cusCols" :key="col.id" :label="col.title">
        <template slot-scope="scope">
          <div v-if="scope.row.cols == null || scope.row.cols[col.id] == null">&lt;未设置&gt;</div>
          <div v-else-if="col.type === 'text'">
            <span v-if="scope.row.cols[col.id].value != null">
              {{ scope.row.cols[col.id].value }}
            </span>
            <span v-else>&lt;未设置&gt;</span>
          </div>
          <div v-else-if="col.type === 'dict'">
            <span v-if="scope.row.cols[col.id].dictDetail != null">
              {{ scope.row.cols[col.id].dictDetail.label }}
            </span>
            <span v-else>&lt;未设置&gt;</span>
          </div>
          <div v-else>&lt;未设置&gt;</div>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','patient:edit','patient:del']" label="操作" width="130px" align="center" fixed="right">
        <template slot-scope="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
            msg="确定删除吗?"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudApi from '@/api/ptt/patient'
import { getOrgs } from '@/api/ptt/org'
import { getByDeptId } from '@/api/ptt/cus'
import { getDictMap } from '@/api/system/dictDetail'
import formCus from './components/FormCus'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = {
  id: null,
  colList: [
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }},
    { text: '', dictDetail: { id: null }, cus: { id: null }}
  ]
}
export default {
  name: 'Cus',
  components: { crudOperation, rrOperation, udOperation, formCus },
  cruds() {
    return CRUD({
      title: '患者附加信息',
      url: 'api/ptt/patient/cols',
      query: { deptId: null, blurry: null },
      // crudMethod: { ...crudApi },
      crudMethod: {
        edit: (form) => {
          return crudApi.updateCols(form)
        }
      },
      queryOnPresenterCreated: false,
      optShow: {
        add: false,
        edit: true,
        del: false,
        download: false,
        reset: false
      }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 设置数据字典
  dicts: [],
  data() {
    return {
      depts: [],
      rules: {
        type: [
          { required: true, message: '请输入类型', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'org:add'],
        edit: ['admin', 'org:edit'],
        del: ['admin', 'org:del']
      },
      // 字典 map
      dictMap: {},
      // 当前用户可以查看的部门
      orgs: [],
      // 当前部门
      currentOrg: { id: null },
      // 当前部门的自定义列
      cusCols: []
    }
  },
  created() {
    // 查询所有医院
    this.getOrgs()
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      console.log(form)
      // 部门
      form.dept = this.currentOrg
      // 设置自定义列
      form.colList = []
      for (let i = 0; i < this.cusCols.length; i++) {
        if (form.cols[this.cusCols[i].id]) {
          form.colList[i] = form.cols[this.cusCols[i].id]
        } else {
          form.colList[i] = { value: '', dictDetail: { id: null }, cus: this.cusCols[i] }
        }
      }
      console.log(form)
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      console.log(this.form)
      // if (this.form.type === 'dict') {
      //   if (this.form.dict.id == null) {
      //     this.$message({
      //       message: '字典不能为空',
      //       type: 'warning'
      //     })
      //     return false
      //   }
      // } else {
      //   this.form.dict.id = null
      // }
      // crudApi.updateCols(this.form).then(res => {
      //   console.log(res)
      // })
      return true
    },
    // 选择医院改变
    handleOrgChange(val) {
      this.currentOrg = val
      this.getTableData(val.id)
    },
    // 获取医院列表
    getOrgs(callback) {
      getOrgs({}).then(res => {
        this.orgs = res
        // 如果没有查询, 则设置默认查询选项并查询列表
        if (this.orgs.length > 0) {
          this.currentOrg = this.orgs[0]
          this.getTableData(this.currentOrg.id)
        }
      })
    },
    getTableData(deptId) {
      this.query.deptId = deptId
      this.crud.toQuery()

      // 获取自定义字段列表
      this.getCusCols()
    },
    // 获取自定义字段列表
    getCusCols() {
      getByDeptId(this.currentOrg.id).then(res => {
        console.log(res)
        this.cusCols = res.content
        // 查询字典
        this.getDictMap()
      })
    },
    // 查询字典
    getDictMap() {
      const dictNames = []
      for (let i = 0; i < this.cusCols.length; i++) {
        if (this.cusCols[i].type === 'dict' && this.cusCols[i].dict) {
          dictNames.push(this.cusCols[i].dict.name)
        }
      }
      getDictMap(dictNames.join(',')).then(res => {
        console.log(res)
        this.dictMap = res
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
