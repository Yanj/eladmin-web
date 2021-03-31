<template>
  <el-select
    v-if="!disabled"
    v-model="currentWorkTime"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    @change="handleWorkTimeChange"
  >
    <el-option v-for="(item, index) in workTimes" :key="index" :label="item.beginTime + '-' + item.endTime" :value="item" />
  </el-select>
  <el-select
    v-else
    v-model="currentWorkTime"
    size="small"
    placeholder="请选择"
    style="width: 200px;"
    class="filter-item"
    value-key="id"
    :disabled="true"
    @change="handleWorkTimeChange"
  >
    <el-option :label="currentWorkTime.name" :value="currentWorkTime" />
  </el-select>
</template>

<script>
import { getAllWorkTime } from '@/api/patientReserve/workTime'

export default {
  name: 'WorkTimePicker',
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
    comId: {
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
      workTimes: [],
      currentWorkTime: this.value
    }
  },
  watch: {
    value: function(val) {
      this.currentWorkTime = val
    },
    comId: function(val) {
      console.log('comId:')
      console.log(val)
      // 加载医院工时
      this.loadAllWorkTimes()
    }
  },
  created() {
    if (!this.disabled) {
      // 加载医院工时
      this.loadAllWorkTimes()
    }
  },
  methods: {
    // 加载医院工时
    loadAllWorkTimes() {
      getAllWorkTime({ comId: this.comId }).then(res => {
        this.workTimes = res.content
        // 如果没有查询, 则设置默认查询选项并查询列表
        if (this.workTimes.length > 0) {
          this.currentWorkTime = this.workTimes[0]
          this.handleWorkTimeChange(this.currentWorkTime)
        }
      })
    },
    handleWorkTimeChange(val) {
      this.$emit('change', this.currentWorkTime)
    }
  }
}
</script>

<style>

</style>
