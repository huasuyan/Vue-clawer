import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },

  // 主界面布局（父路由）
  {
    path: '/',
    component: () => import('@/views/Layout.vue'), // 主界面壳子
    redirect: '/overview', // 默认显示运行概览
    children: [
      //子路由 → 内容显示在 <router-view>
      {
        path: 'overview',
        component: () => import('@/views/Overview.vue')
      },
      {
        path: 'task',
        component: () => import('@/views/Task.vue')
      },
      {
        path: 'execution',
        component: () => import('@/views/Execution.vue')
      },
      {
        path: 'log',
        component: () => import('@/views/Log.vue')
      },
      {
        path: 'user',
        component: () => import('@/views/User.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 要去登录页或注册页
  if (to.path === '/login' || to.path === '/register') {
    // 如果有 token，跳转到运行概览
    if (token) {
      return next('/overview')
    }
    // 没有 token，放行
    return next()
  }

  // 没有 token → 去登录
  if (!token) {
    return next('/login')
  }

  // 有 token → 放行
  next()
})

export default router