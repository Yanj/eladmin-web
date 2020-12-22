<template>
  <div>
    <div v-if="userId">
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
        <el-table-column prop="itemCode" label="项目编码" />
        <el-table-column prop="itemName" label="项目名称" />
        <el-table-column prop="itemPrice" label="单价" />
        <el-table-column label="次数">
          <template slot-scope="scope">
            <span>{{ scope.row.times }} / {{ scope.row.itemTimes }} {{ scope.row.itemUnit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总价">
          <template slot-scope="scope">
            <span><span style="color: grey;">{{ scope.row.itemAmount }}</span><span>{{ scope.row.amount }}</span></span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import crudUser from '@/api/recovery/rcvUserItem'
import CRUD, { presenter, header } from '@crud/crud'

export default {
  components: { },
  cruds() {
    return [
      CRUD({
        title: '患者项目',
        url: 'api/recovery/rcvUserItem',
        query: { userId: null },
        crudMethod: { ...crudUser },
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
      userId: null,
      rules: {
        label: [
          { required: true, message: '请输入字典标签', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入字典值', trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      permission: {
        add: ['admin', 'rcvUserItem:add'],
        edit: ['admin', 'rcvUserItem:edit'],
        del: ['admin', 'rcvUserItem:del']
      }
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.$emit('item-select-changed', { ...val })
    }
  }
}
</script>

<style scoped></style>
