import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/patient',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/patient',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/patient',
    method: 'put',
    data
  })
}

export function getAllPatient() {
  return request({
    url: 'api/yy/patient/list',
    method: 'get'
  })
}

export function syncPatient(data) {
  return request({
    url: 'api/yy/patient/sync',
    method: 'put',
    data
  })
}

export default { add, edit, del, getAllPatient }
