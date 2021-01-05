import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/reserveResource',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/reserveResource',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/reserveResource',
    method: 'put',
    data
  })
}

export function getReserveCountList(deptId) {
  return request({
    url: 'api/yy/reserveResource/reserveCount?deptId=' + deptId,
    method: 'get'
  })
}

export default { add, edit, del, getReserveCountList }

