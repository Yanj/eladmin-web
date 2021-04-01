import request from '@/utils/request'

export function getUserWorkCount(params) {
  return request({
    url: 'api/yy/userWorkCount/list',
    method: 'get',
    params
  })
}

export default { getUserWorkCount }
