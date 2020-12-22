<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable placeholder="输入名称或地址搜索" style="width: 200px" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <el-select v-model="query.enabled" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="470px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="55px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 370px" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" style="width: 370px" />
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio v-for="item in dict.his_setting_status" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="enabled" label="状态" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.enabled"
            :disabled="scope.row.enabled"
            active-color="#409EFF"
            inactive-color="#F56C6C"
            @change="changeEnabled(scope.row, scope.row.enabled)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','hisSetting:edit','hisSetting:del']" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <udOperation
            :data="scope.row"
            :permission="permission"
          />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>

import crudServer from '@/api/recovery/hisSetting'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = { id: null, name: null, enabled: 'false' }
export default {
  name: 'HisSetting',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  cruds() {
    return CRUD({ title: 'HIS设置', url: 'api/recovery/hisSetting', crudMethod: { ...crudServer }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['his_setting_status'],
  data() {
    return {
      loading: false,
      permission: {
        add: ['admin', 'hisSetting:add'],
        edit: ['admin', 'hisSetting:edit'],
        del: ['admin', 'hisSetting:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ]
      },
      enabledTypeOptions: [
        { key: 'true', display_name: '激活' },
        { key: 'false', display_name: '禁用' }
      ]
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      // form.enabled = `${form.enabled}`
    },
    // 删除前做的操作
    [CRUD.HOOK.beforeCrudDelete](crud) {
      console.log(crud)
      // if (crud.form.dataScope === '自定义' && this.deptDatas.length === 0) {
      //   this.$message({
      //     message: '自定义数据权限不能为空',
      //     type: 'warning'
      //   })
      //   return false
      // } else if (crud.form.dataScope === '自定义') {
      //   const depts = []
      //   this.deptDatas.forEach(function(data) {
      //     const dept = { id: data }
      //     depts.push(dept)
      //   })
      //   crud.form.depts = depts
      // } else {
      //   crud.form.depts = []
      // }
      return false
    },
    // 改变状态
    changeEnabled(data, val) {
      this.$confirm('此操作将 "' + this.dict.label.his_setting_status[val] + '" ' + data.name + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudServer.edit(data).then(res => {
          // 无刷新更新其它行的状态
          for (let i = 0; i < this.crud.data.length; i++) {
            if (data.id !== this.crud.data[i].id) {
              this.crud.data[i].enabled = false
            }
          }
          this.crud.notify(this.dict.label.his_setting_status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(err => {
          data.enabled = !data.enabled
          console.log(err.response.data.message)
        })
      }).catch(() => {
        data.enabled = !data.enabled
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }
</style>
