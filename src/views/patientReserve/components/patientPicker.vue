<template>
  <span>
    <el-dialog
      title="选择患者"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="80%"
      :before-close="handleClose"
    >
      <!--患者列表-->
      <patient-list ref="patientList" :com-id="comId" mode="picker" @selection-change="handlePatientSelectionChange" />
      <!--按钮组-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :disabled="confirmButtonDisabled" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-input v-model="patientNames" :disabled="disabled" readonly style="width: 370px;" @focus="handleFocus">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="handlePatientClick" />
    </el-input>
  </span>
</template>

<script>

import patientList from '@/views/patientReserve/patient/components/list'

export default {
  name: 'PatientPicker',
  components: { patientList },
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
      patientNames: this.getPatientNames(this.value),
      currentSelections: this.value,
      confirmButtonDisabled: true
    }
  },
  watch: {
    value: function(val) {
      this.currentSelections = val
      this.patientNames = this.getPatientNames(val)
      console.log(this.currentSelections)
      console.log(this.patientNames)
    },
    dialogVisible: function(val) {
      if (val && this.$refs.patientList) {
        this.$refs.patientList.clearSelection()
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
      this.patientNames = this.getPatientNames(this.currentSelections)
      this.dialogVisible = false
      this.$emit('change', this.currentSelections)
    },
    getPatientNames(val) {
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
    handlePatientClick() {
      this.dialogVisible = true
      if (this.$refs['patientList']) {
        this.$refs['patientList'].query.comId = this.comId
        this.$refs['patientList'].crud.toQuery()
      }
    },
    handleFocus(val) {
      if (val) {
        this.handlePatientClick()
      }
    },
    // 患者选中监听
    handlePatientSelectionChange(selection) {
      this.currentSelections = selection
      let confirmButtonDisabled = true
      if (selection) {
        if ((!this.multi && selection.length === 1) || (this.multi && selection.length > 0)) {
          confirmButtonDisabled = false
        }
      }
      this.confirmButtonDisabled = confirmButtonDisabled
    }
  }
}
</script>
<style></style>
