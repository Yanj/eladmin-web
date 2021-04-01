import request from '@/utils/request'

export function getWorkTimeList(params) {
  return request({
    url: 'api/yy/workTimeReserveList/workTimeList',
    method: 'get',
    params
  })
}

export function getWorkTimeReserveList(params) {
  return request({
    url: 'api/yy/workTimeReserveList/reserveList',
    method: 'get',
    params
  })
}

export default { getWorkTimeList, getWorkTimeReserveList }
