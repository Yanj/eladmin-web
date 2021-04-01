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

export function getAllWorkTimes(params) {
  return request({
    url: 'api/yy/workTime?paged=false',
    method: 'get',
    params
  })
}

export function getWorkTimeByDept(dept) {
  dept = dept || {}
  return request({
    url: 'api/yy/workTime?paged=false',
    method: 'get',
    params: {
      ...dept,
      status: '1'
    }
  })
}

export default { add, edit, del, getAllWorkTimes, getWorkTimeByDept }
