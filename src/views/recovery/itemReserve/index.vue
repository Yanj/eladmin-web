<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="部门" prop="dept.id">
            <treeselect
              v-model="form.dept.id"
              :options="depts"
              :load-options="loadDepts"
              style="width: 178px"
              placeholder="选择部门"
            />
          </el-form-item>
          <el-form-item label="套餐">
            <el-select v-model="form.item.id" placeholder="请选择">
              <el-option v-for="item in items" :key="item.name" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="资源">
            <el-select v-model="form.resource.id" placeholder="请选择">
              <el-option v-for="item in resources" :key="item.name" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="预约日期">
            <el-input v-model="form.date" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-input v-model="form.beginTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-input v-model="form.endTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="时长">
            <el-input v-model="form.timeAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="实际开始时间">
            <el-input v-model="form.actualBeginTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="实际结束时间">
            <el-input v-model="form.actualEndTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-input v-model="form.status" style="width: 370px;" />
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
        <el-table-column prop="code" label="唯一编码" />
        <el-table-column prop="item.name" label="套餐" />
        <el-table-column prop="dept.name" label="部门" />
        <el-table-column prop="resource.name" label="资源" />
        <el-table-column prop="date" label="预约日期">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.date) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="beginTime" label="开始时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.beginTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="timeAmount" label="时长" />
        <el-table-column prop="actualBeginTime" label="实际开始时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.actualBeginTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actualEndTime" label="实际结束时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.actualEndTime) }}</span>
          </template>
        </el-table-column>
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
        <el-table-column v-permission="['admin','rcvItemReserve:edit','rcvItemReserve:del']" label="操作" width="150px" align="center">
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
import crudRcvItemReserve from '@/api/recovery/rcvItemReserve'
import { getDepts, getDeptSuperior } from '@/api/system/dept'
import { getItems } from '@/api/recovery/rcvItem'
import { getResources } from '@/api/recovery/rcvResource'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'

const defaultForm = {
  id: null,
  item: { id: null },
  dept: { id: null },
  resource: { id: null },
  date: null,
  beginTime: null,
  endTime: null,
  timeAmount: null,
  actualBeginTime: null,
  actualEndTime: null,
  status: null
}
export default {
  name: 'RcvItemReserve',
  components: { Treeselect, pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '套餐预约记录', url: 'api/recovery/rcvItemReserve', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvItemReserve }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvItemReserve:add'],
        edit: ['admin', 'rcvItemReserve:edit'],
        del: ['admin', 'rcvItemReserve:del']
      },
      rules: {
        id: [
          { required: true, message: 'id不能为空', trigger: 'blur' }
        ]
      },
      depts: [],
      items: [],
      resources: []
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getItems()
      this.getResources()
      if (form.id == null) {
        this.getDepts()
      } else {
        this.getSupDepts(form.dept.id)
      }
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud) {
      if (!crud.form.dept.id) {
        this.$message({
          message: '部门不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    getSupDepts(deptId) {
      getDeptSuperior(deptId).then(res => {
        const date = res.content
        this.buildDepts(date)
        this.depts = date
      })
    },
    buildDepts(depts) {
      depts.forEach(data => {
        if (data.children) {
          this.buildDepts(data.children)
        }
        if (data.hasChildren && !data.children) {
          data.children = null
        }
      })
    },
    // 获取弹窗内部门数据
    loadDepts({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        getDepts({ enabled: true, pid: parentNode.id }).then(res => {
          parentNode.children = res.content.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 200)
        })
      }
    },
    // 加载套餐
    getItems() {
      getItems({}).then(res => {
        this.items = res
      })
    },
    // 加载资源
    getResources() {
      getResources({}).then(res => {
        this.resources = res
      })
    }
  }
}
</script>

<style scoped>

</style>
