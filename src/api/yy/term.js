import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/term',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/term',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/term',
    method: 'put',
    data
  })
}

export function get(id) {
  return request({
    url: 'api/yy/term/' + id,
    method: 'get'
  })
}

export function editResourceGroup(data) {
  return request({
    url: 'api/yy/term/resourceGroup',
    method: 'put',
    data
  })
}

export function getAllTerms(params) {
  return request({
    url: 'api/yy/term/list',
    method: 'get',
    params
  })
}

export default { add, edit, del, get, editResourceGroup, getAllTerms }
