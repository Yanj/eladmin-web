import request from '@/utils/request'

export function getUserWorkCount(params) {
  return request({
    url: 'api/yy/userWorkCount/list',
    method: 'get',
    params
  })
}

export function getUserWorkCountList(params) {
  return request({
    url: 'api/yy/userWorkCount/countList',
    method: 'get',
    params
  })
}

export function getUserWorkCountGroup(params) {
  return request({
    url: 'api/yy/userWorkCount/group',
    method: 'get',
    params
  })
}

export default { getUserWorkCount, getUserWorkCountList, getUserWorkCountGroup }
