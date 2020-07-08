import request from '../utils/request';

export const fetchData = query => {
  return request({
    url: './table.json',
    method: 'get',
    params: query
  });
};

export const getProcess = () => {
  return request({
    url: '/dev/getProcess',
    method: 'get'
  });
};

export function addTask(data) {
  return request({
    url: '/addTask',
    method: 'post',
    data: data
  })
};

export function getApprovalList() {
  return request({
    url: "/getProcess",
    method: "get"
  })
}

export function startFlow(data) {
  return request({
    url: "/startTask",
    method: "post",
    data: data
  })
}

export function approvalTask(data) {
  return request({
    url: "/approvalTask",
    method: "post",
    data: data
  })
}

