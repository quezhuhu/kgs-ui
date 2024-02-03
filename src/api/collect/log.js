import request from '@/utils/request'

// 查询数据采集日志列表
export function listLog(query) {
  return request({
    url: '/collect/log/list',
    method: 'get',
    params: query
  })
}

// 查询数据采集日志详细
export function getLog(id) {
  return request({
    url: '/collect/log/' + id,
    method: 'get'
  })
}

// 根据tableCode查询日志
export function getLogByTableCode(tableCode){
  return request({
    url: `/collect/log?tableCode=${tableCode}`,
    method: 'get'
  })
}

// 新增数据采集日志
export function addLog(data) {
  return request({
    url: '/collect/log',
    method: 'post',
    data: data
  })
}

// 修改数据采集日志
export function updateLog(data) {
  return request({
    url: '/collect/log',
    method: 'put',
    data: data
  })
}

// 删除数据采集日志
export function delLog(id) {
  return request({
    url: '/collect/log/' + id,
    method: 'delete'
  })
}
