<template>
  <div>
    <div v-if="query.orgName === ''">
      <div class="my-code">点击机构查看详情</div>
    </div>
    <div v-else>
      <!--工具栏-->
      <div class="head-container">
        <div v-if="crud.props.searchToggle">
          <!-- 搜索 -->
          <el-input v-model="query.label" clearable size="small" placeholder="输入部门名称查询" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery" />
          <rrOperation />
        </div>
      </div>
      <!--表单组件-->
      <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio v-for="item in dict.rcv_org_status" :key="item.id" v-model="form.status" :label="item.value">{{ item.label }}</el-radio>
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
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row @selection-change="crud.selectionChangeHandler">
        <el-table-column label="所属机构">
          {{ query.orgName }}
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <span v-for="item in dict.rcv_org_status" :key="item.id">
              <span v-if="scope.row.status === item.value">{{ item.label }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column v-permission="['admin','rcvOrg:edit','rcvOrg:del']" label="操作" width="130px" align="center">
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
import crudRcvDept from '@/api/recovery/rcvDept'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, parentId: null, status: null, remark: null }
export default {
  name: 'RcvDept',
  components: { pagination, rrOperation, udOperation },
  mixins: [presenter(), header(), form(function() {
    return Object.assign({ org: { id: this.orgId }}, defaultForm)
  }), crud()],
  dicts: ['rcv_org_status'],
  cruds() {
    return CRUD({ title: '部门', url: 'api/recovery/rcvDept', query: { orgName: '' },
      idField: 'id',
      sort: 'id,desc',
      crudMethod: { ...crudRcvDept },
      optShow: {
        add: true,
        edit: true,
        del: true,
        reset: false
      },
      queryOnPresenterCreated: false
    })
  },
  data() {
    return {
      orgId: null,
      permission: {
        add: ['admin', 'rcvOrg:add'],
        edit: ['admin', 'rcvOrg:edit'],
        del: ['admin', 'rcvOrg:del']
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
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
