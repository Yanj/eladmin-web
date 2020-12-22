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
        <el-input v-model="query.blurry" clearable placeholder="输入标题搜索" style="width: 200px" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="医院" prop="dept.id">
          <el-select v-model="form.dept.id" placeholder="请选择" disabled="true">
            <el-option v-for="item in orgs" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio v-for="item in typeOptions" :key="item.key" v-model="form.type" :label="item.key">{{ item.display_name }}</el-radio>
        </el-form-item>
        <el-form-item v-if="form.type === 'dict'" label="字典" prop="dict.id">
          <el-select v-model="form.dict.id" placeholder="请选择" @change="handleDictChange">
            <el-option v-for="item in dicts" :key="item.id" :label="item.description" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="排序" prop="deptSort">
          <el-input-number
            v-model.number="form.sort"
            :min="0"
            :max="999"
            controls-position="right"
            style="width: 370px;"
          />
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
      <el-table-column label="医院" prop="dept.name" />
      <el-table-column label="类型" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 'text'">文本</span>
          <span v-else-if="scope.row.type === 'dict'">字典</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="字典">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 'dict'">{{ scope.row.dict.name }}</span>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" prop="title" />
      <el-table-column label="排序" prop="sort" />
      <el-table-column v-permission="['admin','org:edit','org:del']" label="操作" width="130px" align="center" fixed="right">
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
import crudApi from '@/api/ptt/cus'
import { getOrgs } from '@/api/ptt/org'
import { getDicts } from '@/api/system/dict'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'

const defaultForm = {
  id: null,
  dept: { id: null },
  type: null,
  dict: { id: null },
  title: null,
  sort: 999
}
export default {
  name: 'Cus',
  components: { crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({
      title: '自定义列管理',
      url: 'api/ptt/cus',
      query: { deptId: null, blurry: null },
      crudMethod: { ...crudApi },
      queryOnPresenterCreated: false,
      optShow: {
        add: true,
        edit: true,
        del: true,
        download: true,
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
        ],
        sort: [
          { required: true, message: '请输入排序', trigger: 'blur', type: 'number' }
        ]
      },
      permission: {
        add: ['admin', 'org:add'],
        edit: ['admin', 'org:edit'],
        del: ['admin', 'org:del']
      },
      typeOptions: [
        { key: 'text', display_name: '文本' },
        { key: 'dict', display_name: '字典' }
      ],
      dicts: [],
      orgs: [],
      currentOrg: null
    }
  },
  created() {
    // 查询所有医院
    this.getOrgs()
  },
  methods: {
    // 选择医院改变
    handleOrgChange(val) {
      this.query.deptId = val.id
      this.crud.toQuery()
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      form.dept = {
        id: this.currentOrg.id
      }
      // 查询所有字典
      this.getDicts()
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.type === 'dict') {
        if (this.form.dict.id == null) {
          this.$message({
            message: '字典不能为空',
            type: 'warning'
          })
          return false
        }
      } else {
        this.form.dict.id = null
      }
      return true
    },
    getDicts() {
      getDicts({}).then(res => {
        this.dicts = res
      })
    },
    getOrgs() {
      getOrgs({}).then(res => {
        this.orgs = res
        // 如果没有查询, 则设置默认查询选项并查询列表
        if (this.currentOrg == null && this.orgs.length > 0) {
          this.currentOrg = this.orgs[0]
          this.query.deptId = this.currentOrg.id
          this.crud.toQuery()
        }
      })
    },
    handleDictChange(dictId) {
      if (this.form.title !== '') {
        return
      }
      var dict = null
      for (var i = 0; i < this.dicts.length; i++) {
        if (this.dicts[i].id === dictId) {
          dict = this.dicts[i]
          break
        }
      }
      if (dict != null) {
        this.form.title = dict.description
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
    height: 30px;
    line-height: 30px;
  }
</style>
<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
