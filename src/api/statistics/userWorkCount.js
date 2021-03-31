import request from '@/utils/request'

export function getUserWorkCount(params) {
  return request({
    url: 'api/yy/reserve/userWorkCount',
    method: 'get',
    params
  })
}

export default { getUserWorkCount }
