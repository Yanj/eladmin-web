import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/workTime',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/workTime',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/workTime',
    method: 'put',
    data
  })
}

export function getAllByDeptId(deptId) {
  return request({
    url: 'api/yy/workTime',
    method: 'get',
    params: {
      deptId
    }
  })
}

export default { add, edit, del }
