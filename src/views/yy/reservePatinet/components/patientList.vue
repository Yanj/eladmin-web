<template>
  <div class="patientList-container">
    <div v-if="patientTerms==null || patientTerms.length === 0" class="empty">
      没有购买套餐
    </div>
    <div v-else class="content">
      <div v-for="item in patientTerms" :key="item.id" :class="currentPatientTerm != null && currentPatientTerm.id === item.id ? 'current':''" class="list-item-container" @cllick="handleCurrentPatientTerm(item)">
        <div class="list-item-row">
          <label>套餐:</label>
          <span>{{ item.termName }}</span>
        </div>
        <div class="list-item-row">
          <label>次数</label>
          <span>{{ item.times }} / {{ item.termTimes }}</span>
        </div>
        <div class="list-item-row">
          <label>购买日期</label>
          <span>{{ item.createTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import patientTermApi from '@/api/yy/patientTerm'

export default {
  name: 'PatientList',
  props: {
    patientId: {
      type: Number,
      default: null
    }
  },
  data: function() {
    return {
      patientTerms: [],
      currentPatientTerm: null
    }
  },
  watch: {
    patientId: function(val) {
      this.loadPatientList()
    }
  },
  mounted() {
    this.loadPatientList()
  },
  methods: {
    loadPatientList() {
      if (this.patientId) {
        patientTermApi.getListByPatientId(this.patientId).then(res => {
          console.log(res)
          this.currentPatientTerm = res.content
        })
      }
    },
    handleCurrentPatientTerm(patientTerm) {
      this.currentPatientTerm = patientTerm
      this.$emit('change', patientTerm)
    }
  }
}
</script>

<style lang="less" scoped>
.patientList-container {
  width: 100%;
  height: 100%;
  .empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .content {
    width: 100%;
    height: 100%;
    overflow-x: scroll;
    .list-item-container {
      width: calc(100%/3 - 20px);
      height: 100%;
      background-color: white;
      margin: 0 10px;
      .list-item-row {
        width: 100%;
        label {
          color: #666;
        }
        span {
          color: #333;
        }
      }
      &.current {
        background-color: blue;
        .list-item-row label, .list-item-row span {
          color: white;
        }
      }
    }
  }
}
</style>
<style></style>
