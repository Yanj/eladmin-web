<template>
  <div class="app-container">
    <!--工具栏-->
    <div v-show="showHeader" class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable size="small" placeholder="输入患者名称/档案号/手机号进行搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" size="small" label-width="80px">
        <el-form-item label="来源" prop="source">
          <el-select v-model="form.source" style="width: 370px;" @change="handleSourceChange">
            <el-option v-for="item in dict.patient_source" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isSourceExternal" :rules="[{ required: true, message: '请输入外部系统ID', trigger: 'blur' }]" label="外部系统ID" prop="code">
          <el-input v-model="form.code" style="width: 370px;" />
        </el-form-item>
        <el-form-item :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]" label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item v-if="!isSourceExternal" :rules="[{ required: true, message: '请输入档案号', trigger: 'blur' }]" label="档案号" prop="mrn">
          <el-input v-model="form.mrn" style="width: 370px;" />
        </el-form-item>
        <el-form-item :rules="[{ required: true, message: '请输入手机号', trigger: 'blur' },{ type: 'string', len: 11, message: '请输入正确的手机号'}]" label="手机号" prop="phone">
          <el-input v-model="form.phone" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义1" prop="col1">
          <el-input v-model="form.col1" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义2" prop="col2">
          <el-input v-model="form.col2" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义3" prop="col3">
          <el-input v-model="form.col3" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义4" prop="col4">
          <el-input v-model="form.col4" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="自定义5" prop="col5">
          <el-input v-model="form.col5" style="width: 370px;" />
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
      <el-table-column label="外部系统ID" prop="code" width="100" />
      <el-table-column label="来源" prop="source" width="100">
        <template slot-scope="scope">
          <text>{{ dict.label.patient_source[scope.row.source] }}{{ scope.row.source }}</text>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="name" width="100" />
      <el-table-column label="档案号" prop="mrn" width="100" />
      <el-table-column label="手机号" prop="phone" width="100" />
      <el-table-column label="自定义1" prop="col1" />
      <el-table-column label="自定义2" prop="col2" />
      <el-table-column label="自定义3" prop="col3" />
      <el-table-column label="自定义4" prop="col4" />
      <el-table-column label="自定义5" prop="col5" />
      <el-table-column label="备注" prop="remark" />
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
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudApi from '@/api/yy/patient'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  source: null,
  code: null,
  name: null,
  mrn: null,
  phone: null,
  remark: null,
  col1: null,
  col2: null,
  col3: null,
  col4: null,
  col5: null
}
const defaultSource = 'HIS'
export default {
  name: 'Patient',
  components: { crudOperation, rrOperation, udOperation, pagination },
  cruds() {
    return CRUD({
      title: '患者管理',
      url: 'api/yy/patient',
      query: { blurry: null, mrn: null, name: null, phone: null, status: '1' },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['patient_status', 'patient_source'],
  props: {
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const currentSource = defaultSource
    return {
      permission: {
        add: ['admin', 'patient:add'],
        edit: ['admin', 'patient:edit'],
        del: ['admin', 'patient:del']
      },
      currentSource: currentSource
    }
  },
  computed: {
    isSourceExternal: function() {
      return this.currentSource !== defaultSource
    }
  },
  created() {
    if (this.showHeader) {
      setTimeout(() => {
        this.crud.toQuery()
      }, 500)
    }
  },
  methods: {
    // 刷新之后
    [CRUD.HOOK.afterRefresh](crud) {
      this.$emit('after-refresh', crud)
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      if (!form.id) {
        form.source = defaultSource
        this.currentSource = defaultSource
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      return true
    },
    // 处理列表选中事件
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
    setCurrentRowByIndex(index) {
      for (let i = 0; i < this.crud.data.length; i++) {
        if (index === i) {
          this.$refs.table.setCurrentRow(this.crud.data[i])
          break
        }
      }
    },
    handleSourceChange(v) {
      this.currentSource = v
    }
  }
}
</script>

<style scoped>

</style>

