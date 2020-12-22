<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="reserve.code" label="预约号" />
        <el-table-column prop="content" label="变更内容" />
        <el-table-column prop="beforeStatus" label="之前状态" />
        <el-table-column prop="afterStatus" label="现在状态" />
        <el-table-column prop="createBy" label="创建人" />
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudRcvItemReserveLog from '@/api/recovery/rcvItemReserveLog'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import pagination from '@crud/Pagination'

const defaultForm = { }
export default {
  name: 'RcvItemReserveLog',
  components: { pagination },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '套餐预约记录日志', url: 'api/recovery/rcvItemReserveLog', idField: 'id', sort: 'id,desc', crudMethod: { ...crudRcvItemReserveLog }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'rcvItemReserveLog:add'],
        edit: ['admin', 'rcvItemReserveLog:edit'],
        del: ['admin', 'rcvItemReserveLog:del']
      },
      rules: {
        id: [
          { required: true, message: 'id不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
