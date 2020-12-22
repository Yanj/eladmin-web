import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/recovery/rcvItem',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/recovery/rcvItem/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/recovery/rcvItem',
    method: 'put',
    data
  })
}

export function getItems(params) {
  return request({
    url: 'api/recovery/rcvItem/list',
    method: 'get',
    params
  })
}

export default { add, edit, del, getItems }
