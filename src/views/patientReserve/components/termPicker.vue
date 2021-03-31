<template>
  <span>
    <el-dialog
      title="选择套餐"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="80%"
      :before-close="handleClose"
    >
      <term-list ref="termList" mode="picker" @selection-change="handleTermSelectionChange" />
      <!--按钮组-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :disabled="confirmButtonDisabled" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-input v-model="termNames" :disabled="disabled" readonly style="width: 370px;" @focus="handleFocus">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="handleTermClick" />
    </el-input>
  </span>
</template>

<script>
import termList from '@/views/patientReserve/term/components/list'

export default {
  name: 'TermPicker',
  components: { termList },
  props: {
    multi: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: function() {
        return []
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    comId: {
      type: [String, Number],
      default: null
    }
  },
  data: function() {
    return {
      dialogVisible: false,
      termNames: this.getTermNames(this.value),
      currentSelections: this.value,
      confirmButtonDisabled: true
    }
  },
  watch: {
    value: function(val) {
      this.currentSelections = val
      this.termNames = this.getTermNames(val)
      console.log(this.currentSelections)
      console.log(this.termNames)
    },
    dialogVisible: function(val) {
      if (val && this.$refs.table) {
        this.$refs['termList'].clearSelection()
      }
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    },
    handleConfirm() {
      this.termNames = this.getTermNames(this.currentSelections)
      this.dialogVisible = false
      this.$emit('change', this.currentSelections)
    },
    getTermNames(val) {
      let names = ''
      if (val) {
        for (let i = 0; i < val.length; i++) {
          if (names !== '') {
            names += ','
          }
          names += val[i].name
        }
      }
      return names
    },
    handleTermSelectionChange(selection) {
      this.currentSelections = selection
      let confirmButtonDisabled = true
      if (selection) {
        if ((!this.multi && selection.length === 1) || (this.multi && selection.length > 0)) {
          confirmButtonDisabled = false
        }
      }
      this.confirmButtonDisabled = confirmButtonDisabled
    },
    handleRowClick(row) {
      this.$refs['table'].toggleRowSelection(row)
    },
    handleTermClick() {
      this.dialogVisible = true
      if (this.$refs['termList']) {
        this.$refs['termList'].query.comId = this.comId
        this.$refs['termList'].crud.toQuery()
      }
    },
    handleFocus(val) {
      if (val) {
        this.handleTermClick()
      }
    }
  }
}
</script>
<style></style>
