<template>
  <el-dialog
    title="预约核销"
    append-to-body
    :close-on-click-modal="false"
    :visible.sync="dialogVisible"
    width="580px"
    :before-close="handleClose"
  >
    <!--表单组件-->
    <el-form v-if="currentReserve != null" ref="form" inline :model="form" size="small" label-width="120px">
      <el-form-item v-if="currentReserve.patientTerm != null" label="名称">
        <el-input v-model="currentReserve.patientTerm.termName" :disabled="true" style="width: 360px" />
      </el-form-item>
      <el-form-item v-for="(item, index) in form.reserveResources" :key="index" :label="item.resourceCategory.name">
        <el-select v-model="form.reserveResources[index].resource" value-key="id" style="width: 360px">
          <el-option v-for="resource in item.resourceCategory.resources" :key="resource.id" :label="resource.name" :value="resource" />
        </el-select>
      </el-form-item>
    </el-form>
    <!--按钮组-->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import reserveApi from '@/api/yy/reserve'

export default {
  name: 'Verify',
  props: {
    value: {
      type: Object,
      default: function() {
        return {
          id: null,
          patientTerm: {
            id: null,
            termCode: null,
            termName: null
          },
          resourceGroup: {
            id: null,
            name: null
          },
          reserveResources: []
        }
      }
    }
  },
  data: function() {
    return {
      dialogVisible: false,
      currentReserve: this.value,
      form: {
        id: null,
        resourceGroup: { id: null },
        reserveResources: []
      }
    }
  },
  watch: {
    value: function(val) {
      console.log(val)
      this.currentReserve = val
      this.form.resourceGroup = val.resourceGroup
      this.form.id = val.id
      this.form.reserveResources = val.reserveResources || []
    },
    dialogVisible: function(val) {
      if (val) {
        this.loadResourceGroup()
      }
    }
  },
  methods: {
    handleClose() {
      console.log('close')
    },
    handleCancel() {
      this.dialogVisible = false
    },
    handleConfirm() {
      this.dialogVisible = false
      this.$emit('change', this.form)
    },
    // 加载预约的资源组
    loadResourceGroup() {
      reserveApi.getResourceGroup(this.currentReserve.id).then(res => {
        if (res) {
          this.form = {
            id: this.currentReserve.id, // 预约 id
            resourceGroup: { id: res.id }, // 资源组 id
            reserveResources: [] // 资源
          }
          for (let j = 0; j < this.currentReserve.reserveResources.length; j++) {
            const obj = {
              id: this.currentReserve.reserveResources[j].id,
              reserve: { id: this.currentReserve.id },
              resourceGroup: { id: res.id },
              resource: { id: null }
            }
            for (let i = 0; i < res.resourceCategories.length; i++) {
              if (this.currentReserve.reserveResources[j].resourceCategory.id === res.resourceCategories[i].id) {
                obj.resourceCategory = res.resourceCategories[i]
                if (res.resourceCategories[i] && res.resourceCategories[i].resources && res.resourceCategories[i].resources.length === 1) {
                  obj.resource = res.resourceCategories[i].resources[0]
                }
                break
              }
            }
            this.form.reserveResources.push(obj)
          }
        }
      })
    }
  }
}
</script>

<style>

</style>
