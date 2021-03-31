<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <template v-if="hasAdminPermission && !isPickerMode">
          <dept-picker @change="handleDeptChange" />
        </template>
        <el-input v-model="query.blurry" clearable size="small" placeholder="名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-if="hasAdminPermission && !isPickerMode" v-model="query.status" clearable size="small" placeholder="选择状态搜索" style="width: 150px;" class="filter-item" @change="crud.toQuery">
          <el-option v-for="item in dict.term_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="550px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="100px">
        <template v-if="hasAdminPermission">
          <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择部门', trigger:'blur'}]" label="部门">
            <dept-picker v-model="formDept" width="370" :disabled="disableEdit" />
          </el-form-item>
        </template>
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="现价" prop="editPrice">
          <currency-input v-model="form.editPrice" :decimal="2" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="原价" prop="editOriginalPrice">
          <currency-input v-model="form.editOriginalPrice" :decimal="2" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="次数" prop="times">
          <el-input-number v-model.number="form.times" :min="0" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="时长" prop="duration">
          <el-input-number v-model.number="form.duration" :min="0" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="操作员个数" prop="operatorCount">
          <el-input-number v-model.number="form.operatorCount" :min="0" :max="999" controls-position="right" style="width: 370px;" />
        </el-form-item>
        <el-form-item v-if="hasAdminPermission" :rules="[{required:true, message:'请选择状态', trigger:'blur'}]" label="状态" prop="status">
          <el-select v-model="form.status" style="width: 370px;">
            <el-option v-for="item in dict.term_status" :key="item.id" :label="item.label" :value="item.value" />
          </el-select>
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
    <el-row :gutter="10">
      <el-col :span="hasRight ? 16 : 24">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">套餐列表</span>
          </div>
          <!--表格渲染-->
          <el-table
            ref="table"
            v-loading="crud.loading"
            highlight-current-row
            :data="crud.data"
            row-key="id"
            @select="crud.selectChange"
            @select-all="crud.selectAllChange"
            @selection-change="handleSelectionChange"
            @current-change="handleCurrentChange"
            @row-click="handleRowClick"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column v-if="hasAdminPermission" label="组织ID" prop="orgId" width="60" />
            <el-table-column v-if="hasAdminPermission" label="医院ID" prop="comId" width="60" />
            <el-table-column v-if="hasAdminPermission" label="部门ID" prop="deptId" width="60" />
            <el-table-column label="编码" prop="code" width="120" />
            <el-table-column :show-overflow-tooltip="true" label="名称" prop="name" width="200" />
            <el-table-column label="现价(元)" prop="price" width="100">
              <template slot-scope="scope">
                {{ parseMoney(scope.row.price) }}
              </template>
            </el-table-column>
            <el-table-column label="原价(元)" prop="originalPrice" width="100">
              <template slot-scope="scope">
                {{ parseMoney(scope.row.originalPrice) }}
              </template>
            </el-table-column>
            <el-table-column label="次数" width="60">
              <template slot-scope="scope">
                {{ scope.row.times }} {{ scope.row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="时长(分)" prop="duration" width="70" />
            <el-table-column label="操作员个数" prop="operatorCount" width="80" />
            <el-table-column v-if="hasAdminPermission" label="状态" prop="status" width="50">
              <template slot-scope="scope">
                {{ dict.label.term_status[scope.row.status] }}
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" />
            <el-table-column v-permission="['admin','term:edit','term:del']" label="操作" width="130px" align="center" fixed="right">
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
        </el-card>
      </el-col>
      <el-col v-if="hasRight" :span="8">
        <slot name="right" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudApi from '@/api/patientReserve/term'

import CurrencyInput from '@/views/components/CurrencyInput'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

const defaultForm = {
  id: null,
  orgId: null,
  comId: null,
  deptId: null,
  code: null,
  name: null,
  price: null,
  editPrice: null,
  originalPrice: null,
  editOriginalPrice: null,
  times: null,
  unit: null,
  duration: null,
  operatorCount: null,
  status: null,
  remark: null
}
export default {
  name: 'Term',
  components: { crudOperation, rrOperation, udOperation, pagination, CurrencyInput, deptPicker },
  cruds() {
    return CRUD({
      title: '套餐管理',
      url: 'api/yy/term',
      query: { blurry: null, status: null, orgId: null, comId: null, deptId: null },
      queryOnPresenterCreated: true,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud(), hasAdminPermission()],
  dicts: ['term_status'],
  props: {
    mode: {
      type: String,
      default: 'list'
    },
    hasRight: {
      type: Boolean,
      default: false
    },
    comId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      rules: {
        code: [
          { required: true, message: '请输入编码', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        editPrice: [
          { required: true, message: '请输入现价', trigger: 'blur' }
        ],
        editOriginalPrice: [
          { required: true, message: '请输入原价', trigger: 'blur' }
        ],
        times: [
          { required: true, message: '请输入次数', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请输入单位', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'term:add'],
        edit: ['admin', 'term:edit'],
        del: ['admin', 'term:del']
      },
      disableEdit: false,
      formDept: {
        orgId: null,
        comId: null,
        deptId: null
      }
    }
  },
  computed: {
    isPickerMode: function() {
      return this.mode === 'picker'
    }
  },
  created() {
    if (this.isPickerMode) {
      this.query.status = '1'
      this.crud.optShow = {
        add: false,
        edit: false,
        del: false,
        download: false,
        reset: false
      }
    }
  },
  methods: {
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.crud.toQuery()
    },
    // 新增或者编辑之前
    [CRUD.HOOK.beforeToCU](crud, form) {
      // 编辑: 转换金额
      if (form.id) {
        form.editPrice = this.parseMoney(form.price)
        form.editOriginalPrice = this.parseMoney(form.originalPrice)
        this.disableEdit = true
      } else {
        this.disableEdit = false
      }
      this.formDept = {
        orgId: form.orgId,
        comId: form.comId,
        deptId: form.deptId
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      // 提交前, 转换金额
      this.form.price = parseFloat(this.form.editPrice) * 100
      this.form.originalPrice = parseFloat(this.form.editOriginalPrice) * 100
      this.form.orgId = this.formDept.orgId
      this.form.comId = this.formDept.comId
      this.form.deptId = this.formDept.deptId
      return true
    },
    // 刷新之前
    [CRUD.HOOK.beforeRefresh](crud) {
      if (this.isPickerMode) {
        this.query.comId = this.comId
        this.query.status = '1'
      }
    },
    // 刷新之后
    [CRUD.HOOK.afterRefresh](crud) {
      this.$emit('afterRefresh', crud.page.page === 1)
      return true
    },
    handleSelectionChange(selection) {
      this.crud.selectionChangeHandler(selection)
      this.$emit('selection-change', selection)
    },
    handleRowClick(row) {
      this.$refs['table'].toggleRowSelection(row)
    },
    handleCurrentChange(val) {
      this.$emit('current-change', val)
    },
    // 刷新数据
    refreshTable() {
      this.crud.toQuery()
    },
    // 清空表格选中
    clearSelection() {
      this.$refs.table.clearSelection()
    },
    // 清空数据
    clear() {
      this.crud.data = []
    },
    // 保存分组
    saveResourceGroup(obj, callback) {
      const term = { id: obj.id, resourceGroups: [] }
      // 得到已选中的 key 值
      obj.resourceGroupIds.forEach(function(id) {
        const resourceGroup = { id: id }
        term.resourceGroups.push(resourceGroup)
      })
      crudApi.editResourceGroup(term).then(() => {
        this.crud.notify('保存成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        if (callback) {
          callback(true)
        }
        this.update(obj.id)
      }).catch(err => {
        if (callback) {
          callback(false)
        }
        console.log(err.response.data.message)
      })
    },
    // 改变数据
    update(id) {
      // 无刷新更新 表格数据
      crudApi.get(id).then(res => {
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
