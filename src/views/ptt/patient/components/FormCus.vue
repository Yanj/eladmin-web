<template>
  <div style="width: 200px;">
    <div v-if="type==='text'" class="el-input el-input--small">
      <input v-if="type==='text'" :value="value.text" class="el-input__inner" @input="handleTextChange">
    </div>
    <div v-if="type==='dict'" class="el-input el-input--small el-input--suffix">
      <select :value="value.dictDetail.id" class="el-input__inner" @change="handleDictDetailChange">
        <option v-for="detail in dictMap[dict.name]" :key="detail.id" :value="detail.id">{{ detail.label }}</option>
      </select>
      <span class="el-input__suffix"><span class="el-input__suffix-inner"><i class="el-select__caret el-input__icon el-icon-arrow-down" /></span></span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'FormCus',
  props: {
    value: {
      type: Object,
      default: function() {
        return {
          text: null,
          dictDetail: { id: null },
          cus: { id: null }
        }
      }
    },
    dictMap: {
      type: Object,
      default: function() {
        return {}
      }
    },
    dict: {
      type: Object,
      default: function() {
        return {
          id: null
        }
      }
    },
    type: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
    }
  },
  methods: {
    handleTextChange(event) {
      this.$emit('change', { value: event.target.value, dictDetail: { id: null }, cus: this.value.cus })
    },
    handleDictDetailChange(event) {
      this.$emit('change', { value: '', dictDetail: { id: event.target.value }, cus: this.value.cus })
    }
  }
}
</script>

<style></style>
