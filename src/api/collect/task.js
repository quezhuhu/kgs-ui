import request from '@/utils/request'

// 查询采集任务列表
export function listTask(query) {
  return request({
    url: '/collect/task/list',
    method: 'get',
    params: query
  })
}

// 查询采集任务详细
export function getTask(id) {
  return request({
    url: '/collect/task/' + id,
    method: 'get'
  })
}

// 新增采集任务
export function addTask(data) {
  return request({
    url: '/collect/task',
    method: 'post',
    data: data
  })
}

// 修改采集任务
export function updateTask(data) {
  return request({
    url: '/collect/task',
    method: 'put',
    data: data
  })
}

// 删除采集任务
export function delTask(id) {
  return request({
    url: '/collect/task/' + id,
    method: 'delete'
  })
}
