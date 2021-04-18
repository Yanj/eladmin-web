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
      <el-form-item v-for="(item, index) in form.reserveResources" :key="item.id" :label="item.resourceCategory.name">
        <el-select v-model="form.reserveResources[index].resource" value-key="id" style="width: 360px">
          <el-option v-for="resource in item.resourceCategory.resources" :key="resource.id" :label="resource.name" :value="resource" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="操作者">
        <el-select v-model="currentUser" value-key="id">
          <el-option v-for="user in users" :key="user.id" :label="user.nickName" :value="user" />
        </el-select>
      </el-form-item> -->
      <el-form-item v-for="(item, index) in form.operators" :key="index" :label="'操作者'+(index+1)">
        <el-select v-model="form.operators[index]" value-key="id">
          <el-option v-for="user in users" :key="user.id" :label="user.nickName" :value="user" />
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
import reserveApi from '@/api/patientReserve/reserve'
import { getByDeptId } from '@/api/system/user'
import store from '@/store'

export default {
  name: 'ReserveVerify',
  props: {
    value: {
      type: Object,
      default: function() {
        return {
          id: null,
          patientTerm: {
            id: null,
            termCode: null,
            termName: null,
            operatorCount: 1
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
      users: [],
      currentUser: null,
      form: {
        id: null,
        resourceGroup: { id: null },
        reserveResources: [],
        operators: []
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
      this.form.operators = []
      const operatorCount = val.patientTerm.operatorCount || 1
      for (let i = 0; i < operatorCount; i++) {
        this.form.operators.push({ id: null })
      }
      console.log(this.form)
    },
    dialogVisible: function(val) {
      if (val) {
        this.loadResourceGroup()
        this.loadUsers()
        store.dispatch('GetInfo').then((res) => {
          console.log(res)
          if (res) {
            this.currentUser = res.user
          }
        })
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
      this.dialogVisible = false
      this.$emit('change', { ...this.form, operator: this.currentUser })
    },
    // 加载预约的资源组
    loadResourceGroup() {
      reserveApi.getResourceGroup(this.currentReserve.id).then(res => {
        if (res) {
          this.form = {
            id: this.currentReserve.id, // 预约 id
            resourceGroup: { id: res.id }, // 资源组 id
            reserveResources: [], // 资源
            operators: []
          }
          const operatorCount = this.currentReserve.patientTerm.operatorCount || 1
          for (let i = 0; i < operatorCount; i++) {
            this.form.operators.push({ id: null })
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
    },
    // 加载部门用户
    loadUsers() {
      getByDeptId(this.currentReserve.comId).then(res => {
        if (res) {
          this.users = res
        }
      })
    }
  }
}
</script>

<style>

</style>
