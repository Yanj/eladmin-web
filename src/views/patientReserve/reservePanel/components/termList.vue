<template>
  <div class="patientList-container">
    <div class="panel-title">所有套餐套餐</div>
    <div class="panel-content">
      <div v-if="terms==null || terms.length === 0" class="empty">
        没有套餐
      </div>
      <div v-else class="content">
        <div v-for="item in terms" :key="item.id" :class="currentTerm != null && currentTerm.id === item.id ? 'current':''" class="list-item-container" @click="handleCurrentTerm(item)">
          <div class="list-item-row">
            <label>名称: </label>
            <span>{{ item.name }}</span>
          </div>
          <div class="list-item-row">
            <label>次数: </label>
            <span>1 {{ item.unit }}</span>
          </div>
          <div class="list-item-row">
            <label>价格: </label>
            <span>{{ parseMoney(item.price) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import termApi from '@/api/patientReserve/term'
import { parseMoney } from '@/utils'

export default {
  name: 'ReservePanelTermList',
  props: {
    comId: {
      type: [Number, String],
      default: null
    }
  },
  data: function() {
    return {
      query: {
        comId: null
      },
      terms: [],
      currentTerm: null
    }
  },
  watch: {
    comId: function(val) {
      console.log(val)
      this.refresh(val)
    }
  },
  created() {
    this.query.comId = this.comId
  },
  mounted() {
    this.loadTermList()
  },
  methods: {
    parseMoney,
    reset() {
      if (this.terms && this.terms.length > 0) {
        this.handleCurrentTerm(this.terms[0])
      }
    },
    refresh(comId, manual) {
      if (this.query.comId !== comId || manual) {
        this.query.comId = comId
        this.loadTermList()
      }
    },
    loadTermList() {
      console.log(this.query)
      termApi.getAllTerms(this.query).then(res => {
        console.log(res)
        if (res.content) {
          this.terms = res.content
          if (res.content.length > 0) {
            this.currentTerm = res.content[0]
            this.$emit('change', this.currentTerm)
          }
        }
      })
    },
    handleCurrentTerm(term) {
      console.log(term)
      this.currentTerm = term
      this.$emit('change', this.currentTerm)
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
