import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
    // 后端一般是这两种格式，二选一
    config.headers.token = token
    // config.headers.Authorization = `Bearer ${token}`
  }
    return config
  },
  error => {
    return Promise.reject(error)
  }

)

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 处理 401 未授权错误
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      router.push('/login')
      // 返回一个 resolved promise，避免触发业务代码的 catch
      return Promise.resolve({ code: 0, msg: '登录已过期' })
    }

    // 其他错误直接 reject，让业务代码处理
    return Promise.reject(error)
  }
)

export default service