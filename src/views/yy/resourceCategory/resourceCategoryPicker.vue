<template>
  <el-select
    v-if="!disabled"
    v-model="currentResourceCategory"
    value-key="id"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    @change="handleResourceCategoryChange"
  >
    <el-option v-for="resourceCategory in resourceCategories" :key="resourceCategory.id" :label="resourceCategory.name" :value="resourceCategory" />
  </el-select>
  <el-select
    v-else
    v-model="currentResourceCategory"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    :disabled="true"
    @change="handleResourceCategoryChange"
  >
    <el-option :label="currentResourceCategory.name" :value="currentResourceCategory" />
  </el-select>
</template>

<script>
import { getAllResourceCategories } from '@/api/yy/resourceCategory'

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
    deptId: {
      type: Number,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      resourceCategories: [],
      currentResourceCategory: this.value
    }
  },
  watch: {
    value: function(val) {
      console.log(val)
      this.currentResourceCategory = val
    },
    deptId: function(val) {
      // 加载所有资源分类
      this.loadAllResourceCategories()
    }
  },
  created() {
    if (!this.disabled) {
      // 加载所有资源分类
      this.loadAllResourceCategories()
    }
  },
  methods: {
    // 加载所有资源分类
    loadAllResourceCategories() {
      if (!this.deptId) {
        return
      }
      getAllResourceCategories({ deptId: this.deptId }).then(res => {
        this.resourceCategories = res
        // 如果没有查询, 则设置默认查询选项并查询列表
        if (this.resourceCategories.length > 0) {
          this.currentResourceCategory = this.resourceCategories[0]
          this.handleResourceCategoryChange(this.currentResourceCategory)
        }
      })
    },
    handleResourceCategoryChange(val) {
      this.$emit('change', this.currentResourceCategory)
    }
  }
}
</script>

<style>

</style>
