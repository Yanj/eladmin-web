<template>
  <el-select
    v-model="currentOrg"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    @change="handleOrgChange"
  >
    <el-option v-for="org in orgs" :key="org.id" :label="org.name" :value="org">{{ org.name }}</el-option>
  </el-select>
</template>

<script>
import { getOrgs } from '@/api/ptt/org'

export default {
  name: 'OrgPicker',
  props: {
    value: {
      type: Object,
      default: function() {
        return {
          id: null,
          name: null
        }
      }
    }
  },
  data: function() {
    return {
      orgs: [],
      currentOrg: this.value
    }
  },
  created() {
    // 加载所有部门
    this.loadAllOrgs()
  },
  methods: {
    // 加载所有部门
    loadAllOrgs() {
      getOrgs({}).then(res => {
        this.orgs = res
        // 如果没有查询, 则设置默认查询选项并查询列表
        if (this.orgs.length > 0) {
          this.currentOrg = this.orgs[0]
          this.handleOrgChange(this.currentOrg)
        }
      })
    },
    handleOrgChange(val) {
      this.$emit('change', val)
    }
  }
}
</script>

<style>

</style>
