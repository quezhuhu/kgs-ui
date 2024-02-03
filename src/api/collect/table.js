import request from '@/utils/request'

// 查询表基本信息列表
export function listTable(query) {
  return request({
    url: '/collect/table/list',
    method: 'get',
    params: query
  })
}

// 查询表基本信息详细
export function getTable(id) {
  return request({
    url: '/collect/table/' + id,
    method: 'get'
  })
}

// 新增表基本信息
export function addTable(data) {
  return request({
    url: '/collect/table',
    method: 'post',
    data: data
  })
}

// 修改表基本信息
export function updateTable(data) {
  return request({
    url: '/collect/table',
    method: 'put',
    data: data
  })
}

// 删除表基本信息
export function delTable(id) {
  return request({
    url: '/collect/table/' + id,
    method: 'delete'
  })
}
