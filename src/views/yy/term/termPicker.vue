<template>
  <el-select
    v-if="!disabled"
    v-model="currentTerm"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    @change="handleTermChange"
  >
    <el-option v-for="(item, index) in terms" :key="index" :label="item.name" :value="item" />
  </el-select>
  <el-select
    v-else
    v-model="currentTerm"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    :disabled="true"
    @change="handleTermChange"
  >
    <el-option :label="currentTerm.name" :value="currentTerm" />
  </el-select>
</template>

<script>
import { getAllTerms } from '@/api/yy/term'

export default {
  name: 'TermPicker',
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
    disabled: {
      type: Boolean,
      default: false
    },
    checkFirst: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      terms: [],
      currentTerm: this.value
    }
  },
  watch: {
    value: function(val) {
      this.currentTerm = val
    }
  },
  created() {
    if (!this.disabled) {
      // 加载所有套餐
      this.loadAllTerms()
    }
  },
  methods: {
    // 加载所有套餐
    loadAllTerms() {
      getAllTerms({}).then(res => {
        this.terms = res
        // 如果没有查询, 则设置默认查询选项并查询列表
        if (this.checkFirst && this.terms.length > 0) {
          this.currentTerm = this.terms[0]
          this.handleTermChange(this.currentTerm)
        }
      })
    },
    handleTermChange(val) {
      this.$emit('change', this.currentTerm)
    }
  }
}
</script>

<style>

</style>
