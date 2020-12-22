<template>
  <div class="app-container">
    <el-row :gutter="10" style="margin-bottom: 10px">
      <!-- 患者列表 -->
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11">
        <el-card class="box-card">
          <queryPatient
            ref="queryPatient"
            @item-select-changed="handleCurrentPatientChange"
          />
        </el-card>
      </el-col>
      <!-- 患者项目列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <queryPatientTerm
            ref="queryPatientTerm"
            @item-select-changed="handleCurrentPatientTermChange"
          />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <!-- 患者项目预约列表 -->
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <queryPatientTermReserve
            ref="queryPatientTermReserve"
            @item-select-changed="handleCurrentPatientTermReserveChange"
          />
        </el-card>
      </el-col>
      <!-- 预约列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <queryReserveList
            ref="queryReserveList"
            @on-reserve="handleReserve"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import queryPatient from './queryPatient'
import queryPatientTerm from './queryPatientTerm'
import queryPatientTermReserve from './queryPatientTermReserve'
import queryReserveList from './queryReserveList'

export default {
  name: 'PatientSync',
  components: { queryPatient, queryPatientTerm, queryPatientTermReserve, queryReserveList },
  data() {
    return {
      patientTerm: null
    }
  },
  methods: {
    // 患者选中改变
    handleCurrentPatientChange(val) {
      if (val) {
        // 刷新患者套餐
        this.$refs.queryPatientTerm.query.patientId = val.id
        this.$refs.queryPatientTerm.crud.toQuery()
      }
    },
    // 患者套餐选中改变
    handleCurrentPatientTermChange(val) {
      if (val) {
        // 刷新患者套餐预约记录
        this.$refs.queryPatientTermReserve.query.patientTermId = val.id
        this.$refs.queryPatientTermReserve.crud.toQuery()

        // 刷新患者套餐预约时间
        this.patientTerm = val
        if (this.$refs.queryReserveList) {
          this.$refs.queryReserveList.deptId = 32
          this.$refs.queryReserveList.patientTerm = val
          this.$refs.queryReserveList.reload()
        }
      }
    },
    // 患者套餐预约选中改变
    handleCurrentPatientTermReserveChange(val) {
    },
    // 预约监听
    handleReserve() {
      // 刷新患者套餐
      this.$refs.queryPatientTerm.crud.toQuery()
      // 刷新患者套餐预约
      this.$refs.queryPatientTermReserve.crud.toQuery()
    }
  }
}
</script>

<style>
</style>
