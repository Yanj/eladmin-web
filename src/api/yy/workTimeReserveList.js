import request from '@/utils/request'

export function getWorkTimeReserveList(params) {
  return request({
    url: 'api/yy/reserve/workTimeReserveList',
    method: 'get',
    params
  })
}

export default { getWorkTimeReserveList }
