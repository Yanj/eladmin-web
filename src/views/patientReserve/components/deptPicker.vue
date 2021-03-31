<template>
  <el-cascader
    v-if="isShow"
    ref="cascader"
    v-model="currentValue"
    :options="options"
    :props="props"
    :disabled="disabled"
    clearable
    size="small"
    placeholder="请选择"
    :style="{ width: width + 'px' }"
    class="filter-item"
    @change="handleChange"
  >
    <template slot-scope="{node, data}">
      <span>{{ data.label }}</span>
    </template>
  </el-cascader>
</template>

<script>
import deptApi from '@/api/system/dept'

export default {
  name: 'DeptPicker',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    width: {
      type: String,
      default: '200'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default() {
        return {
          orgId: null,
          comId: null,
          deptId: null
        }
      }
    }
  },
  data() {
    const currentValue = [this.value.orgId, this.value.comId, this.value.deptId]
    return {
      isShow: true,
      currentValue: currentValue,
      options: [],
      props: {
        checkStrictly: true,
        value: 'id'
        // lazy: true,
        // lazyLoad(node, resolve) {
        //   console.log(node)
        //   const { level, value } = node
        //   if (level === 0) {
        //     deptApi.getRoot().then(res => {
        //       resolve(res)
        //     })
        //   } else if (level <= 2) {
        //     deptApi.getDepts({ pid: value, enabled: true, paged: false }).then(res => {
        //       resolve(res.content)
        //     })
        //   } else {
        //     resolve()
        //   }
        // }
      }
    }
  },
  computed: {
    dept: function() {
      let orgId = null
      let comId = null
      let deptId = null
      if (this.currentValue.length > 0) {
        orgId = this.currentValue[0]
      }
      if (this.currentValue.length > 1) {
        comId = this.currentValue[1]
      }
      if (this.currentValue.length > 2) {
        deptId = this.currentValue[2]
      }
      return {
        orgId,
        comId,
        deptId
      }
    }
  },
  watch: {
    value: function(val) {
      this.$set(this.currentValue, 0, val.orgId)
      this.$set(this.currentValue, 1, val.comId)
      this.$set(this.currentValue, 2, val.deptId)
      this.makeCascaderTextShow()
    }
  },
  mounted() {
    this.loadTree()
  },
  methods: {
    loadTree() {
      deptApi.getTree().then(res => {
        this.options = res
        this.makeCascaderTextShow()
      })
    },
    // 重新构建级联选择的文本(主要解决数据回显的问题)
    makeCascaderTextShow() {
      if (!this.$refs['cascader']) {
        return
      }
      const arr = this.getRealValue(this.currentValue, this.options, 'id')
      const labels = []
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] && arr[i].label) {
          labels.push(arr[i].label)
        }
      }
      this.$refs['cascader'].inputValue = labels.join(' / ')
    },
    // 从 options 中获取完整的数据
    // 比如:
    // value = [1, 3]
    // options = [ {id:0, label:'0', children:[]}, {id:1, label:'1', children:[{id:2, label:'2'},{id:3, label:'3'}]} ]
    // 结果: [{id:1, label:'1'}, {id:3, label:'3'}]
    getRealValue(value, options, id) {
      const res = []
      const getItem = (val, arr) => {
        if (!val || !arr) {
          return null
        }
        for (let i = 0; i < arr.length; i++) {
          if (arr[i][id] === val) {
            return arr[i]
          }
        }
      }
      for (let i = 0; i < value.length; i++) {
        let arr
        if (i === 0) {
          arr = options
        } else {
          if (res[i - 1]) {
            arr = res[i - 1].children
          }
        }
        res[i] = getItem(value[i], arr)
      }
      return res
    },
    handleChange(node) {
      this.$emit('change', this.dept)
    }
  }
}
</script>

<style>

</style>
