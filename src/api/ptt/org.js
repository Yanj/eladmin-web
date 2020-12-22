import request from '@/utils/request'

export function getOrgs(params) {
  return request({
    url: 'api/ptt/org/list',
    method: 'get',
    params
  })
}

export function getChild(id) {
  return request({
    url: 'api/ptt/org/child?id=' + id,
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'api/ptt/org',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/ptt/org',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/ptt/org',
    method: 'put',
    data
  })
}

export default { add, edit, del, getOrgs, getChild }
