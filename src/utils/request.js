import axios from 'axios'

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
    if (err.response.code === 401) {
      // token 无效/过期
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default service