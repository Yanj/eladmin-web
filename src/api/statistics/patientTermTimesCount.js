import request from '@/utils/request'

export function getPatientTermTimesCount(params) {
  return request({
    url: 'api/yy/patientTermTimesCount/list',
    method: 'get',
    params
  })
}

export default { getPatientTermTimesCount }
