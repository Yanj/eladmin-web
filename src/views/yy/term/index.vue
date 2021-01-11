<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <hospital-picker
          :value="currentHospital"
          @change="handleHospitalChange"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item v-show="false" label="医院">
          <hospital-picker :value="currentHospital" :disabled="true" />
        </el-form-item>
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
          <el-input v-model="form.times" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" style="width: 370px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <div style="display:flex;">
      <div style="flex:3">
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
            @selection-change="crud.selectionChangeHandler"
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="编码" prop="code" width="120" />
            <el-table-column label="名称" prop="name" />
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
            <el-table-column label="次数" width="150">
              <template slot-scope="scope">
                {{ scope.row.times }} {{ scope.row.unit }}
              </template>
            </el-table-column>
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
      </div>
      <div v-permission="permission.editResourceGroup" style="flex:2; margin-left: 10px;">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定分类关联分组" placement="top">
              <span class="role-span">分组关联</span>
            </el-tooltip>
            <el-button
              v-permission="permission.editResourceGroup"
              :disabled="!showButton"
              :loading="resourceGroupLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="saveResourceGroup"
            >保存</el-button>
          </div>
          <el-tree
            ref="resourceGroup"
            lazy
            :data="resourceGroups"
            :default-checked-keys="resourceGroupIds"
            :load="getResourceGroupDatas"
            :props="defaultProps"
            check-strictly
            accordion
            show-checkbox
            node-key="id"
            @check="resourceGroupChange"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import crudApi from '@/api/yy/term'
import { getAllResourceGroups, getChild } from '@/api/yy/resourceGroup'
import hospitalPicker from '@/views/yy/hospital/hospitalPicker'
import CurrencyInput from '@/views/components/CurrencyInput'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  dept: { id: null },
  code: null,
  name: null,
  price: null,
  editPrice: null,
  originalPrice: null,
  editOriginalPrice: null,
  times: null,
  unit: null,
  status: null,
  remark: null
}
export default {
  name: 'Term',
  components: { crudOperation, rrOperation, udOperation, pagination, hospitalPicker, CurrencyInput },
  cruds() {
    return CRUD({
      title: '套餐管理',
      url: 'api/yy/term',
      query: { deptId: null },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
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
        del: ['admin', 'term:del'],
        editResourceGroup: ['admin', 'term:editResourceGroup']
      },
      currentHospital: null,
      defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
      showButton: false,
      resourceGroups: [],
      resourceGroupIds: [],
      currentId: 0,
      resourceGroupLoading: false
    }
  },
  methods: {
    getResourceGroupDatas(node, resolve) {
      // setTimeout(() => {
      //   const deptId = this.currentHospital ? this.currentHospital.id : 0
      //   getResourceGroupsTree(node.data.id ? node.data.id : 0, deptId).then(res => {
      //     resolve(res)
      //   })
      // }, 100)
    },
    // 新增或者编辑之前
    [CRUD.HOOK.beforeToCU](crud, form) {
      // 编辑: 转换金额
      if (form.id) {
        form.editPrice = this.parseMoney(form.price)
        form.editOriginalPrice = this.parseMoney(form.originalPrice)
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.dept === null || this.form.dept.id === null) {
        this.form.dept = this.currentHospital
      }
      if (this.form.dept === null || this.form.dept.id === null) {
        this.$message({
          message: '所属医院不能为空',
          type: 'warning'
        })
        return false
      }
      // 提交前, 转换金额
      this.form.price = parseFloat(this.form.editPrice) * 100
      this.form.originalPrice = parseFloat(this.form.editOriginalPrice) * 100
      return true
    },
    handleHospitalChange(val) {
      this.currentHospital = val
      this.query.deptId = val.id
      this.crud.toQuery()
      // 刷新 tree
      this.getResourceGroups()
    },
    handleCurrentChange(val) {
      if (val) {
        const _this = this
        // 清空分组的选中
        this.$refs.resourceGroup.setCheckedKeys([])
        // 保存当前的分类id
        this.currentId = val.id
        // 初始化默认选中的key
        this.resourceGroupIds = []
        val.resourceGroups.forEach(function(data) {
          _this.resourceGroupIds.push(data.id)
        })
        this.showButton = true
      }
    },
    getResourceGroups() {
      getAllResourceGroups({ deptId: this.currentHospital.id }).then(res => {
        this.resourceGroups = res
      })
    },
    resourceGroupChange(resourceGroupChange) {
      // 获取该节点的所有子节点，id 包含自身
      getChild(resourceGroupChange.id).then(childIds => {
        // 判断是否在 menuIds 中，如果存在则删除，否则添加
        if (this.resourceGroupIds.indexOf(resourceGroupChange.id) !== -1) {
          for (let i = 0; i < childIds.length; i++) {
            const index = this.resourceGroupIds.indexOf(childIds[i])
            if (index !== -1) {
              this.resourceGroupIds.splice(index, 1)
            }
          }
        } else {
          for (let i = 0; i < childIds.length; i++) {
            const index = this.resourceGroupIds.indexOf(childIds[i])
            if (index === -1) {
              this.resourceGroupIds.push(childIds[i])
            }
          }
        }
        this.$refs.resourceGroup.setCheckedKeys(this.resourceGroupIds)
      })
    },
    // 保存分组
    saveResourceGroup() {
      this.resourceGroupLoading = true
      const term = { id: this.currentId, resourceGroups: [] }
      // 得到已选中的 key 值
      this.resourceGroupIds.forEach(function(id) {
        const resourceGroup = { id: id }
        term.resourceGroups.push(resourceGroup)
      })
      crudApi.editResourceGroup(term).then(() => {
        this.crud.notify('保存成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        this.resourceGroupLoading = false
        this.update()
      }).catch(err => {
        this.resourceGroupLoading = false
        console.log(err.response.data.message)
      })
    },
    // 改变数据
    update() {
      // 无刷新更新 表格数据
      crudApi.get(this.currentId).then(res => {
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

