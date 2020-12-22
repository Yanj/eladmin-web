<template>
  <div v-if="query.itemCode !== null">
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" highlight-current-row style="width: 100%;">
      <el-table-column label="预约时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.date, '{y}-{m}-{d}') }} {{ parseTime(scope.row.beginTime, '{h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="timeAmount" label="时长" />
      <el-table-column prop="status" label="状态" />
    </el-table>
  </div>
</template>

<script>
import crudItemReserve from '@/api/recovery/rcvItemReserve'
import CRUD, { presenter, header } from '@crud/crud'

export default {
  components: { },
  cruds() {
    return [
      CRUD({
        title: '患者预约',
        url: 'api/recovery/rcvItemReserve',
        query: {
          itemCode: null
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
    }
  }
}
</script>

<style scoped>

</style>
