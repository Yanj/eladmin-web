<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable size="small" placeholder="输入患者名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <el-row :gutter="15">
      <!-- 患者列表 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17" style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">患者列表</span>
          </div>
          <el-table
            ref="table"
            v-loading="crud.loading"
            :data="crud.data"
            row-key="id"
            @select="crud.selectChange"
            @select-all="crud.selectAllChange"
            @selection-change="crud.selectionChangeHandler"
            @current-change="handleCurrentChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="患者 id" prop="patientId" />
            <el-table-column label="名称" prop="name" />
            <el-table-column label="档案编号" prop="mrn" />
            <el-table-column label="身份证" prop="certNo" />
            <el-table-column label="电话" prop="phone" />
          </el-table>
        </el-card>
      </el-col>
      <!-- 医院列表 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <el-tooltip class="item" effect="dark" content="选择指定患者分配医院" placement="top">
              <span class="role-span">医院分配</span>
            </el-tooltip>
            <el-button
              v-permission="['admin','patient:edit']"
              :disabled="!showButton"
              :loading="deptLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="saveDept"
            >
              保存
            </el-button>
          </div>
          <el-tree
            ref="deptTree"
            lazy
            :data="depts"
            :default-checked-keys="deptIds"
            :load="getDeptDatas"
            :props="defaultProps"
            check-strictly
            accordion
            show-checkbox
            node-key="id"
            @check="deptChange"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudPatient from '@/api/ptt/patient'
import { getOrgs, getChild } from '@/api/ptt/org'

import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'

export default {
  name: 'Patient',
  components: { rrOperation, crudOperation },
  cruds() {
    return CRUD({ title: '患者管理', url: 'api/ptt/patient', crudMethod: { ...crudPatient }, optShow: { add: false, edit: false, del: false, download: false }})
  },
  mixins: [presenter(), header(), crud()],
  // 设置数据字典
  dicts: ['dept_status'],
  data() {
    return {
      permission: {
        add: ['admin', 'patient:add'],
        edit: ['admin', 'patient:edit'],
        del: ['admin', 'patient:del']
      },
      depts: [],
      deptIds: [],
      defaultProps: { children: 'children', label: 'label', isLeaf: 'leaf' },
      currentId: null,
      showButton: false,
      deptLoading: false
    }
  },
  created() {
  },
  methods: {
    getDeptDatas(node, resolve) {
      setTimeout(() => {
        getOrgs({ pid: node.data.id ? node.data.id : null }).then(res => {
          resolve(res.content)
        })
      }, 100)
    },
    [CRUD.HOOK.afterRefresh]() {
      this.$refs.deptTree.setCheckedKeys([])
    },
    handleCurrentChange(val) {
      if (val) {
        const _this = this
        // 清空菜单的选中
        this.$refs.deptTree.setCheckedKeys([])
        // 保存当前的角色id
        this.currentId = val.id
        // 初始化默认选中的key
        this.deptIds = []
        val.depts.forEach(function(data) {
          _this.deptIds.push(data.id)
        })
        this.showButton = true
      }
    },
    deptChange(dept) {
      // 获取该节点的所有子节点，id 包含自身
      getChild(dept.id).then(childIds => {
        // 判断是否在 menuIds 中，如果存在则删除，否则添加
        if (this.deptIds.indexOf(dept.id) !== -1) {
          for (let i = 0; i < childIds.length; i++) {
            const index = this.deptIds.indexOf(childIds[i])
            if (index !== -1) {
              this.deptIds.splice(index, 1)
            }
          }
        } else {
          for (let i = 0; i < childIds.length; i++) {
            this.deptIds.push(childIds[i])
          }
        }
        this.$refs.deptTree.setCheckedKeys(this.deptIds)
      })
    },
    // 保存医院
    saveDept() {
      this.deptLoading = true
      const patient = { id: this.currentId, depts: [] }
      // 得到已选中的 key 值
      this.deptIds.forEach(function(id) {
        const dept = { id: id }
        patient.depts.push(dept)
      })
      crudPatient.editDept(patient).then(() => {
        this.crud.notify('保存成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        this.deptLoading = false
        this.update()
      }).catch(err => {
        this.deptLoading = false
        console.log(err.response.data.message)
      })
    },
    // 改变数据
    update() {
      // 无刷新更新 表格数据
      crudPatient.get(this.currentId).then(res => {
        for (let i = 0; i < this.crud.data.length; i++) {
          if (res.id === this.crud.data[i].id) {
            this.crud.data[i] = res
            break
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>

