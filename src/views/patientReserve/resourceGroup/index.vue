<template>
  <list ref="list" :has-right="hasUpdateResourceCategoryPermission" @after-refresh="handleListRefresh" @current-change="handleCurrentChange">
    <template v-slot:right>
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
    </template>
  </list>
</template>

<script>
import { getAllResourceCategories, getChild } from '@/api/patientReserve/resourceCategory'

import list from './components/list'
import { hasAdminPermission } from '@/components/YyDept'

export default {
  name: 'ResourceGroup',
  components: { list },
  mixins: [hasAdminPermission()],
  data() {
    return {
      defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
      showButton: false,
      resourceCategories: [],
      resourceCategoryIds: [],
      currentId: 0,
      resourceCategoryLoading: false
    }
  },
  computed: {
    hasUpdateResourceCategoryPermission: function() {
      return this.hasAdminPermission || true
    }
  },
  methods: {
    handleCurrentChange(val) {
      console.log('handleCurrentChange')
      this.setResourceCategory(val)
    },
    setResourceCategory(val) {
      if (!this.hasUpdateResourceCategoryPermission) {
        return
      }
      this.showButton = false
      // 清空分组的选中
      this.$refs.resourceCategory.setCheckedKeys([])
      // 保存当前的分类id
      this.currentId = val ? val.id : null
      // 初始化默认选中的key
      this.resourceCategoryIds = []
      if (val) {
        const _this = this
        val.resourceCategories.forEach(function(data) {
          _this.resourceCategoryIds.push(data.id)
        })
        this.showButton = true
      }
    },
    handleListRefresh(isFirst) {
      if (!this.hasUpdateResourceCategoryPermission) {
        return
      }
      this.setResourceCategory()
      if (isFirst) {
        this.getResourceCategories()
      }
    },
    getResourceCategoryDatas(node, resolve) {
    },
    getResourceCategories() {
      const query = this.$refs['list'].query
      getAllResourceCategories({ orgId: query.orgId, comId: query.comId, deptId: query.deptId }).then(res => {
        this.resourceCategories = res.content
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
      this.$refs['list'].saveResourceCategory({ id: this.currentId, resourceCategoryIds: this.resourceCategoryIds }, () => {
        this.resourceCategoryLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
