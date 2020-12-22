import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/ptt/patientTermReserve',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/ptt/patientTermReserve',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/ptt/patientTermReserve',
    method: 'put',
    data
  })
}

export function checkIn(data) {
  return request({
    url: 'api/ptt/patientTermReserve/checkIn',
    method: 'put',
    data
  })
}

export function cancel(data) {
  return request({
    url: 'api/ptt/patientTermReserve/cancel',
    method: 'put',
    data
  })
}

export function verify(data) {
  return request({
    url: 'api/ptt/patientTermReserve/verify',
    method: 'put',
    data
  })
}

export function get(id) {
  return request({
    url: 'api/ptt/patientTermReserve/' + id,
    method: 'get'
  })
}

export function reserve(data) {
  return request({
    url: 'api/ptt/patientTermReserve/reserve',
    method: 'post',
    data
  })
}

export default { add, edit, del, checkIn, cancel, verify, get, reserve }
