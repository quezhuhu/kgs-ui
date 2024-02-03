import request from '@/utils/request'

// 查询数据采集记录列表
export function listRecord(query) {
  return request({
    url: '/collect/record/list',
    method: 'get',
    params: query
  })
}

// 查询数据采集记录详细
export function getRecord(id) {
  return request({
    url: '/collect/record/' + id,
    method: 'get'
  })
}

// 新增数据采集记录
export function addRecord(data) {
  return request({
    url: '/collect/record',
    method: 'post',
    data: data
  })
}

// 修改数据采集记录
export function updateRecord(data) {
  return request({
    url: '/collect/record',
    method: 'put',
    data: data
  })
}

// 删除数据采集记录
export function delRecord(id) {
  return request({
    url: '/collect/record/' + id,
    method: 'delete'
  })
}
