<template>
  <el-select
    v-if="!disabled"
    v-model="currentHospital"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    @change="handleHospitalChange"
  >
    <el-option v-for="(hospital, index) in hospitals" :key="index" :label="hospital.name" :value="hospital" />
  </el-select>
  <el-select
    v-else
    v-model="currentHospital"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    :disabled="true"
    @change="handleHospitalChange"
  >
    <el-option :label="currentHospital.name" :value="currentHospital" />
  </el-select>
</template>

<script>
import { getUserAllHospitals } from '@/api/yy/hospital'

export default {
  name: 'HospitalPicker',
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
    }
  },
  data: function() {
    return {
      hospitals: [],
      currentHospital: this.value
    }
  },
  watch: {
    value: function(val) {
      this.currentHospital = val
    }
  },
  created() {
    if (!this.disabled) {
      // 加载用户所有医院
      this.loadAllHospitals()
    }
  },
  methods: {
    // 加载用户所有医院
    loadAllHospitals() {
      getUserAllHospitals({}).then(res => {
        this.hospitals = res
        // 如果没有查询, 则设置默认查询选项并查询列表
        if (this.hospitals.length > 0) {
          this.currentHospital = this.hospitals[0]
          this.handleHospitalChange(this.currentHospital)
        }
      })
    },
    handleHospitalChange(val) {
      this.$emit('change', this.currentHospital)
    }
  }
}
</script>

<style>

</style>
