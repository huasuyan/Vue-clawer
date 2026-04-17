import request from '@/utils/request'

// 获取图形验证码
export const getCaptchaCodeAPI = () => {
  return request({
    url: '/api/v1/auth/getCode',
    method: 'get'
  })
}

// 账号密码登录
export const loginAPI = (data) => {
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    data
  })
}

// 获取短信验证码
export const getSmsCodeAPI = (phone) => {
  return request({
    url: '/api/v1/auth/sendCode',
    method: 'post',
    params: { phone }
  })
}

// 短信验证码登录
export const codeLoginAPI = (data) => {
  return request({
    url: '/api/v1/auth/codeLogin',
    method: 'post',
    data
  })
}

// 用户注册
export const registerAPI = (data) => {
  return request({
    url: '/api/v1/auth/register',
    method: 'post',
    data
  })
}

//删除token
export const delTokenAPI = (data) => {
  return request({
    url: '/api/v1/auth/delToken',
    method: 'post',
    data
  })
}

// 更新用户信息
export const updateUserAPI = (data) => {
  return request({
    url: '/api/v1/user/update',
    method: 'post',
    data
  })
}

// 查询爬虫列表
export const getCrawlerListAPI = (data) => {
  return request({
    url: '/api/v1/crawlers/pageList',
    method: 'post',
    data
  })
}

// 创建爬虫
export const createCrawlerAPI = (data) => {
  return request({
    url: '/api/v1/crawlers/script',
    method: 'post',
    data
  })
}

// 查询单个爬虫信息
export const getCrawlerByIdAPI = (jobId) => {
  return request({
    url: `/api/v1/crawlers/searchByJobId?jobId=${jobId}`,
    method: 'post'
  })
}

// 更新爬虫信息
export const updateCrawlerAPI = (data) => {
  return request({
    url: '/api/v1/crawlers/update',
    method: 'post',
    data
  })
}

// 删除爬虫
export const deleteCrawlerAPI = (jobId) => {
  return request({
    url: `/api/v1/crawlers/delete?jobId=${jobId}`,
    method: 'post'
  })
}

// 手动执行爬虫
export const executeCrawlerAPI = (jobId) => {
  return request({
    url: `/api/v1/crawlers/execute?jobId=${jobId}`,
    method: 'post'
  })
}

// 启用/停止爬虫
export const activateCrawlerAPI = (jobId) => {
  return request({
    url: `/api/v1/crawlers/activate?jobId=${jobId}`,
    method: 'post'
  })
}
