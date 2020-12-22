import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/recovery/rcvResource',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/recovery/rcvResource/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/recovery/rcvResource',
    method: 'put',
    data
  })
}

export function getResources(params) {
  return request({
    url: 'api/recovery/rcvResource/list',
    method: 'get',
    params
  })
}

export default { add, edit, del, getResources }
