import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/recovery/rcvResourceType',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/recovery/rcvResourceType/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/recovery/rcvResourceType',
    method: 'put',
    data
  })
}

export function getResourceTypes(params) {
  return request({
    url: 'api/recovery/rcvResourceType/list',
    method: 'get',
    params
  })
}

export default { add, edit, del, getResourceTypes }
