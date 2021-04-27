import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/yy/reserve',
    method: 'post',
    data
  })
}

export function addList(data) {
  return request({
    url: 'api/yy/reserve/list',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/yy/reserve',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/yy/reserve',
    method: 'put',
    data
  })
}

export function verify(data) {
  return request({
    url: 'api/yy/reserve/verify',
    method: 'post',
    data
  })
}

export function checkIn(data) {
  return request({
    url: 'api/yy/reserve/checkIn',
    method: 'post',
    data
  })
}

export function cancel(data) {
  return request({
    url: 'api/yy/reserve/cancel',
    method: 'post',
    data
  })
}

export function getResourceGroup(id) {
  return request({
    url: 'api/yy/reserve/resources?id=' + id,
    method: 'get'
  })
}

export function getReserveCount(params) {
  return request({
    url: 'api/yy/reserve/reserveCount',
    method: 'get',
    params
  })
}

export function getReserveListByPatientTermId(patientTermId) {
  return request({
    url: 'api/yy/reserve',
    method: 'get',
    params: {
      patientTermId
    }
  })
}

export function getTodayCount(deptId) {
  return request({
    url: 'api/yy/reserve/todayCount',
    method: 'get',
    params: {
      deptId
    }
  })
}

export function getWeekCount(deptId) {
  return request({
    url: 'api/yy/reserve/weekCount',
    method: 'get',
    params: {
      deptId
    }
  })
}

export function getWorkTimeCount(deptId) {
  return request({
    url: 'api/yy/reserve/workTimeCount',
    method: 'get',
    params: {
      deptId
    }
  })
}

export function getTermCount(params) {
  return request({
    url: 'api/yy/reserve/termCount',
    method: 'get',
    params
  })
}

export function getReserveCountList(params) {
  return request({
    url: 'api/yy/reserveResource/reserveCount',
    method: 'get',
    params
  })
}

export function getReserveCountList2(params) {
  return request({
    url: 'api/yy/reserveResource/reserveCount2',
    method: 'get',
    params
  })
}

export default { add, addList, edit, del, verify, checkIn, cancel, getResourceGroup, getReserveCountList, getReserveCountList2 }
