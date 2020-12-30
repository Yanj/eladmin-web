import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/resourceGroup',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/resourceGroup',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/resourceGroup',
    method: 'put',
    data
  })
}

export function get(id) {
  return request({
    url: 'api/yy/resourceGroup/' + id,
    method: 'get'
  })
}

export function getAllResourceGroups(params) {
  return request({
    url: 'api/yy/resourceGroup/list',
    method: 'get',
    params
  })
}

export function getAllTermResourceGroups(deptId, termCode) {
  return request({
    url: 'api/yy/resourceGroup/term?deptId=' + deptId + '&termCode=' + termCode,
    method: 'get'
  })
}

export function getResourceGroupsTree(pid, deptId) {
  return request({
    url: 'api/yy/resourceGroup/lazy?pid=' + pid + '&deptId=' + deptId,
    method: 'get'
  })
}

export function getChild(id) {
  return request({
    url: 'api/yy/resourceGroup/child?id=' + id,
    method: 'get'
  })
}

export function editResourceCategory(data) {
  return request({
    url: 'api/yy/resourceGroup/resourceCategory',
    method: 'put',
    data
  })
}

export default { add, edit, del, get, editResourceCategory }
