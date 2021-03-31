import request from '@/utils/request'

export function getPatientTermTimesCount(params) {
  return request({
    url: 'api/yy/patientTerm/patientTermTimesCount',
    method: 'get',
    params
  })
}

export default { getPatientTermTimesCount }
