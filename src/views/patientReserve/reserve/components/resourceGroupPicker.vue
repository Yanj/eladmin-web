<template>
  <el-select
    v-if="!disabled"
    v-model="currentResourceGroup"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    @change="handleResourceGroupChange"
  >
    <el-option v-for="(item, index) in resourceGroups" :key="index" :label="item.name" :value="item" />
  </el-select>
  <el-select
    v-else
    v-model="currentResourceGroup"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    :disabled="true"
    @change="handleResourceGroupChange"
  >
    <el-option :label="currentResourceGroup.name" :value="currentResourceGroup" />
  </el-select>
</template>

<script>
import { getAllResourceGroups, getResourceGroupsByTermCode } from '@/api/patientReserve/resourceGroup'

export default {
  name: 'ResourceCategoryPicker',
  props: {
    value: {
      type: Object,
      default: function() {
        return {
          id: null,
          name: null
        }
      }
    },
    type: {
      type: String,
      default: 'dept' || 'term'
    },
    comId: {
      type: String,
      default: null
    },
    termCode: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      resourceGroups: [],
      currentResourceGroup: this.value
    }
  },
  watch: {
    value: function(val) {
      console.log('value:' + val)
      this.currentResourceGroup = val
    },
    type: function(val) {
      console.log('type:' + val)
      // 加载所有资源分组
      this.loadAllResourceGroups()
    },
    termCode: function(val) {
      console.log('termCode:' + val)
      // 加载所有资源分组
      this.loadAllResourceGroups()
    },
    comId: function(val) {
      console.log('comId:' + val)
      // 加载所有资源分组
      this.loadAllResourceGroups()
    }
  },
  created() {
    if (!this.disabled) {
      // 加载所有资源分组
      this.loadAllResourceGroups()
    }
  },
  methods: {
    // 加载所有资源分组
    loadAllResourceGroups() {
      const cb = res => {
        this.resourceGroups = res.content
        // 如果没有查询, 则设置默认查询选项并查询列表
        if ((this.type === 'dept' && this.resourceGroups.length > 0) || this.resourceGroups.length === 1) {
          this.currentResourceGroup = this.resourceGroups[0]
          this.handleResourceGroupChange(this.currentResourceGroup)
        }
      }
      if (this.type === 'dept') {
        getAllResourceGroups({ comId: this.comId }).then(cb)
      } else if (this.type === 'term') {
        if (this.termCode != null) {
          getResourceGroupsByTermCode({ comId: this.comId }, this.termCode).then(cb)
        }
      }
    },
    handleResourceGroupChange(val) {
      this.$emit('change', this.currentResourceGroup)
    }
  }
}
</script>

<style>

</style>
