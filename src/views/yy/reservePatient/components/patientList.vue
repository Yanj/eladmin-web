<template>
  <div class="patientList-container">
    <div class="panel-title">患者已购买套餐</div>
    <div class="panel-content">
      <div v-if="patientId == null" class="empty">
        请先查询患者信息
      </div>
      <div v-else-if="patientTerms==null || patientTerms.length === 0" class="empty">
        没有购买套餐
      </div>
      <div v-else class="content">
        <div v-for="item in patientTerms" :key="item.id" :class="currentPatientTerm != null && currentPatientTerm.id === item.id ? 'current':''" class="list-item-container" @click="handleCurrentPatientTerm(item)">
          <div class="list-item-row">
            <label>套餐名称: </label>
            <span>{{ item.termName }}</span>
          </div>
          <div class="list-item-row">
            <label>剩余次数: </label>
            <span>{{ item.times }}</span>
          </div>
          <div class="list-item-row">
            <label>成交金额: </label>
            <span>{{ parseMoney(item.price) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import patientTermApi from '@/api/yy/patientTerm'
import { parseMoney } from '@/utils'

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
      query: {
        patientId: null
      },
      patientTerms: [],
      currentPatientTerm: null
    }
  },
  watch: {
    patientId: function(val) {
      console.log(val)
      this.refresh(val)
    }
  },
  created() {
    this.query.patientId = this.patientId
  },
  mounted() {
    this.loadPatientList()
  },
  methods: {
    parseMoney,
    refresh(patientId, manual) {
      if (this.query.patientId !== patientId || manual) {
        this.query.patientId = patientId
        this.loadPatientList()
      }
    },
    loadPatientList() {
      console.log(this.query)
      if (this.query.patientId) {
        patientTermApi.getListByPatientId(this.query.patientId).then(res => {
          console.log(res)
          if (res) {
            // this.patientTerms = [...res, ...res, ...res]
            this.patientTerms = res
            this.currentPatientTerm = res[0]
          }
        })
      }
    },
    handleCurrentPatientTerm(patientTerm) {
      console.log(patientTerm)
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
  .panel-title {
    width: 100%;
    padding: 8px 10px;
    line-height: 23px;
    color: #909399;
    font-size: 12px;
  }
  .panel-content {
    border: 1px solid #DDDDDD;
    border-width: 1px 0;
    padding: 10px 0;
    box-sizing: border-box;
  }
  .empty {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999999;
    font-size: 0.8em;
  }
  .content {
    width: 100%;
    height: 100%;
    overflow-x: scroll;
    display: flex;
    flex-direction: row;
    align-items: center;
    .list-item-container {
      width: calc(100%/3 - 20px);
      height: 100%;
      background-color: white;
      margin: 0 10px 10px 10px;
      border: 1px solid #EEE;
      border-radius: 8px;
      padding: 10px 20px;
      box-sizing: border-box;
      .list-item-row {
        width: 100%;
        margin-top: 6px;
        display: flex;
        &:first-child {
          margin: 0;
        }
        label {
          color: #666;
          font-size: 14px;
          display: inline-block;
          width: 80px;
          text-align: right;
        }
        span {
          color: #333;
          font-size: 14px;
          font-weight: bold;
          margin-left: 10px;
          flex: 1;
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow:ellipsis;
        }
      }
      &.current {
        background-color: #36a3f7;
        .list-item-row label, .list-item-row span {
          color: white;
        }
      }
    }
  }
}
</style>
<style>
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  background-color: #F5F5F5;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: #F5F5F5;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
  background-color: #555;
}
</style>
