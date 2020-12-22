import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/recovery/rcvDept',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/recovery/rcvDept/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/recovery/rcvDept',
    method: 'put',
    data
  })
}

export function getDepts(params) {
  return request({
    url: 'api/recovery/rcvDept/list',
    method: 'get',
    params
  })
}

export default { add, edit, del, getDepts }
