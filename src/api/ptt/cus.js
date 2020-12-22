import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/ptt/cus',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/ptt/cus',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/ptt/cus',
    method: 'put',
    data
  })
}

export function getByDeptId(deptId) {
  return request({
    url: 'api/ptt/cus',
    method: 'get',
    params: {
      deptId
    }
  })
}

export default { add, edit, del, getByDeptId }
