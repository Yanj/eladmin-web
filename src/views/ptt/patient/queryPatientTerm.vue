<template>
  <div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row style="width: 100%;" @selection-change="crud.selectionChangeHandler" @current-change="handleCurrentChange">
      <el-table-column prop="termCode" label="项目编码" />
      <el-table-column prop="termName" label="项目名称" />
      <el-table-column prop="termPrice" label="单价">
        <template slot-scope="scope">
          <span>{{ parseMoney(scope.row.termPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="次数">
        <template slot-scope="scope">
          <span>{{ scope.row.times }} / {{ scope.row.termTimes }} {{ scope.row.termUnit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总价">
        <template slot-scope="scope">
          <span>
            <span>{{ parseMoney(scope.row.amount) }}</span>
            (
            <strike style="color: grey;">{{ parseMoney(scope.row.termAmount) }}</strike>
            )
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudUser from '@/api/ptt/patientTerm'
import CRUD, { presenter, header } from '@crud/crud'

export default {
  components: { },
  cruds() {
    return [
      CRUD({
        title: '患者项目',
        url: 'api/ptt/patientTerm',
        query: { patientId: null },
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
