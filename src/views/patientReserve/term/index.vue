<template>
  <list ref="list" :has-right="true" @afterRefresh="handleListRefresh" @selection-change="handleCurrentChange">
    <template v-slot:right>
      <el-card class="box-card" shadow="never">
        <div slot="header" class="clearfix">
          <el-tooltip class="item" effect="dark" content="选择指定分类关联分组" placement="top">
            <span class="role-span">分组关联</span>
          </el-tooltip>
          <div style="position: relative; float: right;">
            <el-button
              v-permission="permission.addResourceGroup"
              :disabled="!showAddButton"
              :loading="resourceGroupLoading"
              icon="el-icon-check"
              size="mini"
              style="position: absolute; right: 0px; padding: 6px 9px;"
              type="primary"
              @click="saveResourceGroup"
            >保存</el-button>
            <el-button
              v-permission="permission.editResourceGroup"
              :disabled="!showButton"
              :loading="resourceGroupLoading"
              icon="el-icon-check"
              size="mini"
              style="position: absolute; right: 0px; padding: 6px 9px;"
              type="primary"
              @click="saveResourceGroup"
            >保存</el-button>
          </div>
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
    </template>
  </list>
</template>

<script>
import { getAllResourceGroups, getChild } from '@/api/patientReserve/resourceGroup'

import { hasAdminPermission } from '@/components/YyDept'

import list from './components/list'

export default {
  name: 'Term',
  components: { list },
  mixins: [hasAdminPermission()],
  data() {
    return {
      permission: {
        addResourceGroup: ['admin', 'term:addResourceGroup'],
        editResourceGroup: ['admin', 'term:editResourceGroup']
      },
      defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
      showButton: false,
      showAddButton: false,
      resourceGroups: [],
      resourceGroupIds: [],
      listSelections: [],
      currentId: 0,
      resourceGroupLoading: false
    }
  },
  computed: {
    hasUpdateResourceGroupPermission: function() {
      return this.hasAdminPermission
    }
  },
  methods: {
    handleCurrentChange(val) {
      console.log('handleCurrentChange')
      console.log(val)
      this.listSelections = val
      if (val && val.length === 1) {
        this.setResourceGroup(val[0])
      } else {
        this.setResourceGroup()
      }
    },
    setResourceGroup(val) {
      console.log(val)
      // if (!this.hasUpdateResourceGroupPermission) {
      //   return
      // }
      this.showButton = false
      this.showAddButton = false
      // 清空分组的选中
      this.$refs.resourceGroup.setCheckedKeys([])
      // 保存当前的分类id
      this.currentId = val ? val.id : null
      // 初始化默认选中的key
      this.resourceGroupIds = []
      if (val) {
        const _this = this
        if (val.resourceGroups) {
          val.resourceGroups.forEach(function(data) {
            _this.resourceGroupIds.push(data.id)
          })
        }
        this.showButton = true
        if (val.resourceGroups && val.resourceGroups.length === 0) {
          this.showAddButton = true
        }
      }
    },
    handleListRefresh(isFirst, selections) {
      // if (!this.hasUpdateResourceGroupPermission) {
      //   return
      // }
      this.listSelections = selections
      // 清空选中
      this.setResourceGroup()
      // if (isFirst) {
      //   this.getResourceGroups()
      // }
      // 刷新分组
      this.getResourceGroups()
    },
    getResourceGroupDatas() {},
    getResourceGroups() {
      const query = this.$refs['list'].query
      getAllResourceGroups({ orgId: query.orgId, comId: query.comId, deptId: query.deptId }).then(res => {
        this.resourceGroups = res.content
        this.setResourceGroup(this.listSelections)
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
      this.$refs['list'].saveResourceGroup({ id: this.currentId, resourceGroupIds: this.resourceGroupIds }, () => {
        this.resourceGroupLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
