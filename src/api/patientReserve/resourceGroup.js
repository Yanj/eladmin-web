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

/**
 * 根据 ID 获取资源分组
 * @param {*} id .
 * @returns .
 */
export function get(id) {
  return request({
    url: 'api/yy/resourceGroup/' + id,
    method: 'get'
  })
}

/**
 * 修改分组分类
 * @param {*} data .
 * @returns .
 */
export function editResourceCategory(data) {
  return request({
    url: 'api/yy/resourceGroup/resourceCategory',
    method: 'put',
    data
  })
}

/**
 * 获取所有符合条件的资源分组
 *
 * @param {*} params .
 * @returns .
 */
export function getAllResourceGroups(params) {
  return request({
    url: 'api/yy/resourceGroup?paged=false',
    method: 'get',
    params
  })
}

/**
 * 获取子节点(含自身)
 *
 * @param {*} id .
 * @returns .
 */
export function getChild(id) {
  return request({
    url: 'api/yy/resourceGroup/child?id=' + id,
    method: 'get'
  })
}

/**
 * 获取符合条件的资源分组
 * @param {*} dept .
 * @param {*} termCode .
 * @returns .
 */
export function getResourceGroupsByTermCode(dept, termCode) {
  dept = dept || {}
  return request({
    url: 'api/yy/resourceGroup',
    method: 'get',
    params: {
      paged: false,
      orgId: dept.orgId,
      comId: dept.comId,
      deptId: dept.deptId,
      termCode: termCode
    }
  })
}

export default { add, edit, del, get, editResourceCategory }
