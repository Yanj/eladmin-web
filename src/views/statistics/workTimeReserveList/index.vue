<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <dept-picker v-if="hasAdminPermission" @change="handleDeptChange" />
      <el-date-picker
        v-model="query.date"
        :clearable="false"
        :picker-options="datePickOptions"
        type="date"
        size="small"
        placeholder="选择日期"
        value-format="yyyy-MM-dd"
        class="filter-item"
        @change="handleDateChange"
      />
      <el-select
        v-model="query.verifyStatus"
        :clearable="false"
        placeholder="预约状态"
        size="small"
        class="filter-item"
        @change="handleVerifyStatusChange"
      >
        <el-option v-for="item in verifyStatus" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button
        class="filter-item"
        size="small"
        type="primary"
        @click="handleQuery"
      >查询</el-button>
      <el-button
        :loading="downloadLoading"
        :disabled="!tableData.length"
        class="filter-item"
        size="small"
        type="warning"
        @click="handleDownload"
      >导出</el-button>
      <el-button
        class="filter-item"
        size="small"
        @click="handlePrint"
      >打印</el-button>
    </div>
    <div id="printWrapper">
      <el-table v-loading="tableLoading" :data="tableData" border>
        <el-table-column label="资源组" align="center" width="150">
          <template slot-scope="scope">
            {{ scope.row.resourceGroup.name }}
          </template>
        </el-table-column>
        <el-table-column v-for="(item, index) in tableColumns" :key="index" :label="item.label" align="center" :width="showStatus ? 100 : 60">
          <template slot-scope="scope">
            <span v-for="(reserve, reserveIndex) in scope.row.list[index].reserves" :key="reserve.id" :class="'verify-status-' + reserve.verifyStatus" style="display: block;text-align: left;padding-left: 5px;">
              {{ reserveIndex !== 0 ? '' : '' }}
              {{ reserve.patient.name }}
              <i v-if="showStatus">({{ verifyStatus_labels[reserve.verifyStatus] }})</i>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="color-description-container">
      <label class="color-title">状态说明:</label>
      <div class="color-description">
        <i class="color-block color-status-init" />
        <label class="color-label">已预约</label>
      </div>
      <div class="color-description">
        <i class="color-block color-status-check_in" />
        <label class="color-label">已签到</label>
      </div>
      <div class="color-description">
        <i class="color-block color-status-verified" />
        <label class="color-label">已核销</label>
      </div>
      <div class="color-description">
        <i class="color-block color-status-canceled" />
        <label class="color-label">已取消</label>
      </div>
    </div>
  </div>
</template>

<script>

import { hasAdminPermission } from '@/components/YyDept'
import deptPicker from '@/views/patientReserve/components/deptPicker'

import workTimeReserveListApi from '@/api/statistics/workTimeReserveList'
import { download } from '@/api/data'

import { getDate, formatDate } from '@/utils'
import { downloadFile } from '@/utils/index'

export default {
  name: 'WorkTimeReserveList',
  components: { deptPicker },
  mixins: [hasAdminPermission()],
  data() {
    return {
      datePickOptions: {
        // disabledDate: (date) => {
        //   return date.getTime() > Date.now()
        // }
      },
      query: {
        orgId: null,
        comId: null,
        deptId: null,
        date: null,
        verifyStatus: ''
      },
      tableLoading: false,
      tableColumns: [],
      tableData: [],
      verifyStatus: [
        { label: '全部', value: '' },
        { label: '已预约', value: 'init' },
        { label: '已签到', value: 'check_in' },
        { label: '已核销', value: 'verified' },
        { label: '已取消', value: 'canceled' }
      ],
      verifyStatus_labels: {
        'init': '已预约',
        'check_in': '已签到',
        'verified': '已核销',
        'canceled': '已取消'
      },
      // showStatus: true,
      showStatus: false,
      downloadLoading: false
    }
  },
  created() {
    this.query.date = formatDate(getDate(0))
    this.loadWorkTimes()
  },
  methods: {
    handleDeptChange(dept) {
      this.query.orgId = dept.orgId
      this.query.comId = dept.comId
      this.query.deptId = dept.deptId
      this.loadWorkTimes()
    },
    handleDateChange(val) {
      this.loadData()
    },
    handleVerifyStatusChange(val) {
      this.loadData()
    },
    handleQuery() {
      this.loadWorkTimes()
    },
    loadWorkTimes() {
      if (!this.query.comId && this.hasAdminPermission) {
        return
      }
      this.tableLoading = true
      workTimeReserveListApi.getWorkTimeList(this.query).then(res => {
        if (res) {
          const arr = []
          for (let i = 0; i < res.length; i++) {
            arr.push({ label: res[i].beginTime })
          }
          this.tableColumns = arr
          this.loadData()
        }
      }).catch(() => {
        this.tableLoading = false
      })
    },
    loadData() {
      this.tableLoading = true
      workTimeReserveListApi.getWorkTimeReserveList(this.query).then(res => {
        if (res) {
          // this.showStatus = !this.query.verifyStatus
          this.tableData = res
        }
        this.tableLoading = false
      }).catch(() => {
        this.tableLoading = false
      })
    },
    handleDownload() {
      this.downloadLoading = true
      download('api/yy/workTimeReserveList/download', this.query).then(result => {
        downloadFile(result, this.query.date + '数据', 'xlsx')
        this.downloadLoading = false
      }).catch(() => {
        this.downloadLoading = false
      })
    },
    handlePrint() {
      const subOutputRankPrint = document.getElementById('printWrapper')
      // console.log(subOutputRankPrint.innerHTML)
      const newContent = subOutputRankPrint.innerHTML
      const oldContent = document.body.innerHTML
      document.body.innerHTML = newContent
      window.print()
      window.location.reload()
      document.body.innerHTML = oldContent
      return false
    }
  }
}
</script>

<style lang="less" scoped>
.color-description-container {
  width: 100%;
  padding: 10px 0;
  display: flex;
  .color-title {
    font-size: 14px;
    color: #333;
  }
  .color-description {
    display: flex;
    margin: 0 5px;
    align-items: center;
    .color-block {
      display: inline-block;
      width: 24px;
      height: 16px;
      margin-right: 2px;
    }
    .color-label {
      color: #333;
      font-size: 12px;
      line-height: 16px;
    }
    .color-status-init {
      background: green;
    }
    .color-status-check_in {
      background: red;
    }
    .color-status-verified {
      background: blue;
    }
    .color-status-canceled {
      background: #666;
    }
  }
}
</style>
<style>
#printWrapper .el-table .cell {
  padding: 0;
}
.verify-status-init {
  color: green;
}
.verify-status-check_in {
  color: red;
}
.verify-status-verified {
  color: blue;
}
.verify-status-canceled {
  color: #666;
}
</style>
