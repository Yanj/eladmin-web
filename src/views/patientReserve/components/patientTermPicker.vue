<template>
  <span>
    <el-dialog
      title="选择患者套餐"
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      width="80%"
      :before-close="handleClose"
    >
      <patient-term-list ref="patientTermList" :patient-id="currentPatient.id" mode="picker" @selection-change="handlePatientTermSelectionChange" />
      <!--按钮组-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" :disabled="confirmButtonDisabled" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-input v-model="patientTermNames" :disabled="disabled" readonly style="width: 370px;" @focus="handleFocus">
      <i slot="suffix" class="el-input__icon el-icon-search" @click="handlePatientTermClick" />
    </el-input>
  </span>
</template>

<script>
import patientTermList from '@/views/patientReserve/patientTerm/components/list'

export default {
  name: 'PatientTermPicker',
  components: { patientTermList },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
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
    patient: {
      type: Object,
      default: function() {
        return { id: null }
      }
    }
  },
  data: function() {
    return {
      currentPatient: this.patient,
      dialogVisible: false,
      patientTermNames: this.getPatientTermNames(this.value),
      currentSelections: this.value,
      confirmButtonDisabled: true
    }
  },
  watch: {
    value: function(val) {
      this.currentSelections = val
      this.patientTermNames = this.getPatientTermNames(val)
    },
    patient: function(val) {
      this.currentPatient = val
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
      this.patientTermNames = this.getPatientTermNames(this.currentSelections)
      this.dialogVisible = false
      this.$emit('change', this.currentSelections)
    },
    getPatientTermNames(val) {
      let names = ''
      if (val) {
        for (let i = 0; i < val.length; i++) {
          if (names !== '') {
            names += ','
          }
          names += val[i].termName
        }
      }
      return names
    },
    handlePatientTermSelectionChange(selection) {
      this.currentSelections = selection
      let confirmButtonDisabled = true
      if (selection) {
        if ((!this.multi && selection.length === 1) || (this.multi && selection.length > 0)) {
          confirmButtonDisabled = false
        }
      }
      this.confirmButtonDisabled = confirmButtonDisabled
    },
    handlePatientTermClick() {
      this.dialogVisible = true
      if (this.$refs['patientTermList']) {
        this.$refs['patientTermList'].query.patientId = this.currentPatient.id
        this.$refs['patientTermList'].crud.toQuery()
      }
    },
    handleFocus(val) {
      if (val) {
        this.handlePatientTermClick()
      }
    }
  }
}
</script>
<style></style>
