import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/resourceCategory',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/resourceCategory',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/resourceCategory',
    method: 'put',
    data
  })
}

export function get(id) {
  return request({
    url: 'api/yy/resourceCategory/' + id,
    method: 'get'
  })
}

export function editResourceGroup(data) {
  return request({
    url: 'api/yy/resourceCategory/resourceGroup',
    method: 'put',
    data
  })
}

export function getAllResourceCategories(params) {
  return request({
    url: 'api/yy/resourceCategory?paged=false',
    method: 'get',
    params
  })
}

export function getChild(id) {
  return request({
    url: 'api/yy/resourceCategory/child?id=' + id,
    method: 'get'
  })
}

export default { add, edit, del, get, editResourceGroup }
