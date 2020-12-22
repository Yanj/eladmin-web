import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/ptt/resourceType',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/ptt/resourceType',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/ptt/resourceType',
    method: 'put',
    data
  })
}

export function getResourceTypes(params) {
  return request({
    url: 'api/ptt/resourceType',
    method: 'get',
    params
  })
}

export default { add, edit, del, getResourceTypes }
