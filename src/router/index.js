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
    redirect: '/dashboard', // 默认显示数据大屏
    children: [
      //子路由 → 内容显示在 <router-view>
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'public-opinion/search',
        component: () => import('@/views/PublicOpinionSearch.vue')
      },
      {
        path: 'public-opinion/history',
        component: () => import('@/views/PublicOpinionHistory.vue')
      },
      {
        path: 'warning/config',
        component: () => import('@/views/warning/WarningConfig.vue')
      },
      {
        path: 'warning/add',
        component: () => import('@/views/warning/WarningAdd.vue')
      },
      {
        path: 'warning/edit/:id',
        component: () => import('@/views/warning/WarningAdd.vue')
      },
      {
        path: 'warning/records',
        component: () => import('@/views/warning/WarningRecords.vue')
      },
      {
        path: 'system/organization',
        component: () => import('@/views/system/Organization.vue')
      },
      {
        path: 'system/role',
        component: () => import('@/views/system/Role.vue')
      },
      {
        path: 'system/log',
        component: () => import('@/views/system/Log.vue')
      },
      {
        path: 'document/warning-map',
        component: () => import('@/views/document/WarningMap.vue')
      },
      {
        path: 'document/process',
        component: () => import('@/views/document/DocumentProcess.vue')
      },
      {
        path: 'document/query',
        component: () => import('@/views/document/DocumentQuery.vue')
      },
      {
        path: 'analysis/hotspot',
        component: () => import('@/views/analysis/HotspotAnalysis.vue')
      },
      {
        path: 'analysis/competitor',
        component: () => import('@/views/analysis/CompetitorAnalysis.vue')
      },
      {
        path: 'analysis/report',
        component: () => import('@/views/analysis/Report.vue')
      },
      {
        path: 'analysis/report-setting',
        component: () => import('@/views/analysis/ReportSetting.vue')
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
    // 如果有 token，跳转到数据大屏
    if (token) {
      return next('/dashboard')
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