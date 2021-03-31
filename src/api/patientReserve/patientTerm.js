import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/patientTerm',
    method: 'post',
    data
  })
}

export function addFreeOne(data) {
  return request({
    url: 'api/yy/patientTerm/freeOne',
    method: 'post',
    data
  })
}

export function addFreeTwo(data) {
  return request({
    url: 'api/yy/patientTerm/freeTwo',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/patientTerm',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/patientTerm',
    method: 'put',
    data
  })
}

export function getById(id) {
  return request({
    url: 'api/yy/patientTerm/' + id,
    method: 'get'
  })
}

export function getAllPatientTerms(params) {
  return request({
    url: 'api/yy/patientTerm?paged=false',
    method: 'get',
    params
  })
}

export default { add, edit, del, getById, getAllPatientTerms, addFreeOne, addFreeTwo }
