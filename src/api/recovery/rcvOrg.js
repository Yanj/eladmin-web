import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/recovery/rcvOrg',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/recovery/rcvOrg/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/recovery/rcvOrg',
    method: 'put',
    data
  })
}

export function getOrgs(params) {
  return request({
    url: 'api/recovery/rcvOrg/list',
    method: 'get',
    params
  })
}

export default { add, edit, del, getOrgs }
