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
          <hospital-picker :value="form.dept" :disabled="true" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px;" />
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
    <div style="display:flex;">
      <div style="flex:3">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">资源分组列表</span>
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
            <el-table-column label="名称" prop="name" width="250" />
            <el-table-column label="备注" prop="remark" />
            <el-table-column v-permission="['admin','resourceGroup:edit','resourceGroup:del']" label="操作" width="130px" align="center" fixed="right">
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
      <div v-permission="permission.editResourceCategory" style="flex:2;margin-left:10px;">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定分类关联分组" placement="top">
              <span class="role-span">分类关联</span>
            </el-tooltip>
            <el-button
              v-permission="['admin','resourceCategory:edit']"
              :disabled="!showButton"
              :loading="resourceCategoryLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="saveResourceCategory"
            >保存</el-button>
          </div>
          <el-tree
            ref="resourceCategory"
            lazy
            :data="resourceCategories"
            :default-checked-keys="resourceCategoryIds"
            :load="getResourceCategoryDatas"
            :props="defaultProps"
            check-strictly
            accordion
            show-checkbox
            node-key="id"
            @check="resourceCategoryChange"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import crudApi from '@/api/yy/resourceGroup'
import { getAllResourceCategories, getChild } from '@/api/yy/resourceCategory'
import hospitalPicker from '@/views/yy/hospital/hospitalPicker'

import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  dept: { id: null, name: '' },
  name: '',
  status: null,
  remark: null
}
export default {
  name: 'ResourceGroup',
  components: { crudOperation, rrOperation, udOperation, pagination, hospitalPicker },
  cruds() {
    return CRUD({
      title: '资源分组管理',
      url: 'api/yy/resourceGroup',
      query: { deptId: null },
      queryOnPresenterCreated: false,
      crudMethod: { ...crudApi }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      rules: {
        name: [
          { required: true, message: '请输入分组名称', trigger: 'blur' }
        ]
      },
      permission: {
        add: ['admin', 'resourceGroup:add'],
        edit: ['admin', 'resourceGroup:edit'],
        del: ['admin', 'resourceGroup:del'],
        editResourceCategory: ['admin', 'resourceGroup:editResourceCategory']
      },
      currentHospital: null,
      defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
      showButton: false,
      resourceCategories: [],
      resourceCategoryIds: [],
      currentId: 0,
      resourceCategoryLoading: false
    }
  },
  methods: {
    getResourceCategoryDatas(node, resolve) {
      // setTimeout(() => {
      //   const deptId = this.currentHospital ? this.currentHospital.id : 0
      //   getResourceCategoriesTree(node.data.id ? node.data.id : 0, deptId).then(res => {
      //     resolve(res)
      //   })
      // }, 100)
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      form.dept = this.currentHospital
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
      return true
    },
    handleHospitalChange(val) {
      this.currentHospital = val
      this.query.deptId = val.id
      this.crud.toQuery()
      // 刷新 tree
      this.getResourceCategories()
    },
    handleCurrentChange(val) {
      if (val) {
        const _this = this
        // 清空分组的选中
        this.$refs.resourceCategory.setCheckedKeys([])
        // 保存当前的分类id
        this.currentId = val.id
        // 初始化默认选中的key
        this.resourceCategoryIds = []
        val.resourceCategories.forEach(function(data) {
          _this.resourceCategoryIds.push(data.id)
        })
        this.showButton = true
      }
    },
    getResourceCategories() {
      getAllResourceCategories({ deptId: this.currentHospital.id }).then(res => {
        this.resourceCategories = res
      })
    },
    resourceCategoryChange(resourceCategoryChange) {
      // 获取该节点的所有子节点，id 包含自身
      getChild(resourceCategoryChange.id).then(childIds => {
        // 判断是否在 menuIds 中，如果存在则删除，否则添加
        if (this.resourceCategoryIds.indexOf(resourceCategoryChange.id) !== -1) {
          for (let i = 0; i < childIds.length; i++) {
            const index = this.resourceCategoryIds.indexOf(childIds[i])
            if (index !== -1) {
              this.resourceCategoryIds.splice(index, 1)
            }
          }
        } else {
          for (let i = 0; i < childIds.length; i++) {
            const index = this.resourceCategoryIds.indexOf(childIds[i])
            if (index === -1) {
              this.resourceCategoryIds.push(childIds[i])
            }
          }
        }
        this.$refs.resourceCategory.setCheckedKeys(this.resourceCategoryIds)
      })
    },
    // 保存分类
    saveResourceCategory() {
      this.resourceCategoryLoading = true
      const resourceGroup = { id: this.currentId, resourceCategories: [] }
      // 得到已选中的 key 值
      this.resourceCategoryIds.forEach(function(id) {
        const resourceCategory = { id: id }
        resourceGroup.resourceCategories.push(resourceCategory)
      })
      crudApi.editResourceCategory(resourceGroup).then(() => {
        this.crud.notify('保存成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        this.resourceCategoryLoading = false
        this.update()
      }).catch(err => {
        this.resourceCategoryLoading = false
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

