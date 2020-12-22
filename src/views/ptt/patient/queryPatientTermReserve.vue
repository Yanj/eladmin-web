<template>
  <div v-if="query.itemCode !== null">
    <!--表单-->
    <el-dialog append-to-body title="核销" width="500px" :close-on-click-modal="false" :visible.sync="formVisible">
      <el-form ref="resourceForm" :model="form" label-width="100px">
        <el-form-item
          v-for="(reserveResource, index) in form.reserveResources"
          :key="index"
          v-model="form.reserveResources[index]"
          :label="'资源' + (index + 1) + (index === 0 ? '*' : '')"
        >
          <el-select
            v-model="form.reserveResources[index].resourceType.id"
            placeholder="请选择资源类型"
            style="float:left;"
            @change="handleResourceTypeChange(index)"
          >
            <el-option
              v-for="(resourceType, resourceTypeIndex) in resourceTypes"
              :key="resourceTypeIndex"
              :label="resourceType.name"
              :value="resourceType.id"
            >
              {{ resourceType.name }}
            </el-option>
          </el-select>
          <el-select
            v-model="form.reserveResources[index].resource.id"
            placeholder="请选择资源"
            style="float:left;"
          >
            <el-option
              v-for="(resource, resourceIndex) in resources[form.reserveResources[index].resourceType.id]"
              :key="resourceIndex"
              :label="resource.name"
              :value="resource.id"
            >
              {{ resource.name }}
            </el-option>
          </el-select>
          <el-button :disabled="index === 0" @click="handleRemoveResource(index)">移除</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button type="primary" @click="handleAddResource">增加资源</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      highlight-current-row
      style="width: 100%;"
      @selection-change="crud.selectionChangeHandler"
      @current-change="handleCurrentChange"
    >
      <el-table-column label="预约时间" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.date }} {{ scope.row.beginTime }}-{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template slot-scope="scope">
          <span v-if="scope.row.status === '0'">已预约</span>
          <span v-if="scope.row.status === '1'">已签到</span>
          <span v-if="scope.row.status === '2'">已核销</span>
          <span v-if="scope.row.status === '3'">已作废</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <div v-if="scope.row.status === '0'">
            <el-button
              size="mini"
              type="text"
              @click="handleCheckIn(scope.row, scope.$index)"
            >
              签到
            </el-button>
            <el-button
              size="mini"
              type="text"
              @click="handleCancel(scope.row, scope.$index)"
            >
              作废
            </el-button>
          </div>
          <div v-if="scope.row.status === '1'">
            <el-button
              size="mini"
              type="text"
              @click="handleVerify(scope.row, scope.$index)"
            >
              核销
            </el-button>
          </div>
          <div v-if="scope.row.status === '2'">无</div>
          <div v-if="scope.row.status === '3'">无</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudItemReserve from '@/api/ptt/patientTermReserve'
import { getResourceTypes } from '@/api/ptt/resourceType'
import { getResources } from '@/api/ptt/resource'
import CRUD, { presenter, header } from '@crud/crud'

const defaultReserveResourceItem = {
  resourceType: { id: null },
  resource: { id: null }
}

export default {
  components: { },
  cruds() {
    return [
      CRUD({
        title: '患者项目预约',
        url: 'api/ptt/patientTermReserve',
        query: {
          patientTermId: null
        },
        crudMethod: { ...crudItemReserve },
        queryOnPresenterCreated: false
      })
    ]
  },
  mixins: [
    presenter(),
    header()
  ],
  data() {
    return {
      deptId: 32,
      formVisible: false,
      form: {
        reserve: null,
        reserveResources: []
      },
      resourceTypes: [],
      resources: {},
      currentIndex: -1
    }
  },
  created() {
  },
  methods: {
    // 选中行改变
    handleCurrentChange(val) {
      this.$emit('item-select-changed', val)
    },
    getResourceTypes() {
      getResourceTypes({ deptId: this.deptId }).then(res => {
        this.resourceTypes = res.content
      })
    },
    getResources() {
      getResources({ deptId: this.deptId }).then(res => {
        this.resources = res
      })
    },
    handleCheckIn(row, index) {
      this.currentIndex = index
      const data = { id: row.id }
      crudItemReserve.checkIn(data).then(res => {
        if (this.currentIndex >= 0) {
          this.crud.data[this.currentIndex].status = '1'
        }
      })
    },
    handleCancel(row, index) {
      this.currentIndex = index
      const data = { id: row.id }
      crudItemReserve.cancel(data).then(res => {
        if (this.currentIndex >= 0) {
          this.crud.data[this.currentIndex].status = '3'
        }
      })
    },
    handleVerify(row, index) {
      this.getResourceTypes()
      this.getResources()
      this.currentIndex = index
      console.log(this.currentIndex)
      this.form.reserve = row
      this.form.reserveResources = [JSON.parse(JSON.stringify(defaultReserveResourceItem))]
      this.formVisible = true
    },
    handleResourceTypeChange(index) {
      this.form.reserveResources[index].resource = { id: null }
    },
    handleAddResource() {
      this.form.reserveResources.push(JSON.parse(JSON.stringify(defaultReserveResourceItem)))
    },
    handleRemoveResource(index) {
      this.form.reserveResources.splice(index, 1)
    },
    submit() {
      const data = []
      for (let i = 0; i < this.form.reserveResources.length; i++) {
        data.push({
          patientTermReserve: this.form.reserve,
          resource: this.form.reserveResources[i].resource
        })
      }
      crudItemReserve.verify(data).then(res => {
        if (this.currentIndex >= 0) {
          this.crud.data[this.currentIndex].status = '2'
        }
      })
    },
    cancel() {
      this.formVisible = false
    }
  }
}
</script>

<style scoped>

</style>
