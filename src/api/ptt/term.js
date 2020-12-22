import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/ptt/term',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/ptt/term',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/ptt/term',
    method: 'put',
    data
  })
}

export function getTerms(params) {
  return request({
    url: 'api/ptt/term',
    method: 'get',
    params
  })
}

export function getTimeList(params) {
  return request({
    url: 'api/ptt/term/timeList',
    method: 'get',
    params
  })
}

export default { add, edit, del, getTerms, getTimeList }
