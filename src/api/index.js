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
