import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/hospital',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/hospital',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/hospital',
    method: 'put',
    data
  })
}

export function getUserAllHospitals(params) {
  return request({
    url: 'api/yy/hospital/user',
    method: 'get',
    params
  })
}

export default { add, edit, del }
