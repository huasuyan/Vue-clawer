<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="logo">
        <div class="logo-icon">
          <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
        </div>
        <span class="logo-text">淇安荣讯</span>
      </div>
      <div class="user-info">
        <div class="user-dropdown" @click="toggleDropdown">
          <div class="user-avatar"></div>
          <span>{{ userName }}</span>
          <el-icon class="dropdown-icon" :class="{ 'is-active': showDropdown }">
            <ArrowDown />
          </el-icon>
        </div>
        <div v-if="showDropdown" class="dropdown-menu">
          <div class="dropdown-item" @click="refreshPermission">
            <el-icon><Refresh /></el-icon>
            <span>刷新权限</span>
          </div>
          <div class="dropdown-item" @click="changePassword">
            <el-icon><Edit /></el-icon>
            <span>修改密码</span>
          </div>
          <div class="dropdown-item" @click="logout">
            <el-icon><Close /></el-icon>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 左侧菜单 -->
      <div class="aside">
        <router-link to="/dashboard">数据大屏</router-link>

        <!-- 舆情监测下拉菜单 -->
        <div class="menu-item">
          <div class="menu-title" @click="togglePublicOpinion">
            <span>舆情监测</span>
            <el-icon class="menu-arrow" :class="{ 'is-expanded': showPublicOpinion }">
              <ArrowDown />
            </el-icon>
          </div>
          <transition name="slide">
            <div v-show="showPublicOpinion" class="submenu">
              <router-link to="/public-opinion/monitor">舆情监测</router-link>
              <router-link to="/public-opinion/search">舆情检索</router-link>
            </div>
          </transition>
        </div>

        <!-- 舆情预警下拉菜单 -->
        <div class="menu-item">
          <div class="menu-title" @click="toggleWarning">
            <span>舆情预警</span>
            <el-icon class="menu-arrow" :class="{ 'is-expanded': showWarning }">
              <ArrowDown />
            </el-icon>
          </div>
          <transition name="slide">
            <div v-show="showWarning" class="submenu">
              <router-link to="/warning/config">预警专题配置</router-link>
              <router-link to="/warning/records">预警记录</router-link>
            </div>
          </transition>
        </div>

        <!-- 舆情分析下拉菜单 -->
        <div class="menu-item">
          <div class="menu-title" @click="toggleAnalysis">
            <span>舆情分析</span>
            <el-icon class="menu-arrow" :class="{ 'is-expanded': showAnalysis }">
              <ArrowDown />
            </el-icon>
          </div>
          <transition name="slide">
            <div v-show="showAnalysis" class="submenu">
              <router-link to="/analysis/report">舆情报告</router-link>
              <router-link to="/analysis/report-setting">舆情报告设置</router-link>
            </div>
          </transition>
        </div>

        <!-- 办件管理下拉菜单 -->
        <div class="menu-item">
          <div class="menu-title" @click="toggleDocument">
            <span>办件管理</span>
            <el-icon class="menu-arrow" :class="{ 'is-expanded': showDocument }">
              <ArrowDown />
            </el-icon>
          </div>
          <transition name="slide">
            <div v-show="showDocument" class="submenu">
              <router-link to="/document/warning-map">预警地图</router-link>
              <router-link to="/document/process" class="submenu-with-badge">
                <span>办件办理</span>
                <el-badge :value="10" class="submenu-badge" />
              </router-link>
              <router-link to="/document/query">办件查询</router-link>
            </div>
          </transition>
        </div>

        <!-- 系统管理下拉菜单 -->
        <div class="menu-item">
          <div class="menu-title" @click="toggleSystem">
            <span>系统管理</span>
            <el-icon class="menu-arrow" :class="{ 'is-expanded': showSystem }">
              <ArrowDown />
            </el-icon>
          </div>
          <transition name="slide">
            <div v-show="showSystem" class="submenu">
              <router-link to="/system/role">角色管理</router-link>
              <router-link to="/system/organization">组织架构</router-link>
            </div>
          </transition>
        </div>

        <router-link to="/message" class="message-link">
          <span>我的消息</span>
          <el-badge :value="unreadCount" class="message-badge" />
        </router-link>
      </div>

      <!-- 右侧内容区域 -->
      <div class="main">
        <!-- 子页面在这里显示！！！ -->
        <router-view />
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordChange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { delTokenAPI, updateUserAPI, refreshAuthorityAPI, getUnreadCountAPI } from '@/api'
import { ElMessage, ElNotification } from 'element-plus'
import { ArrowDown, Refresh, Edit, Close } from '@element-plus/icons-vue'
import md5 from 'js-md5'
import wsClient from '@/utils/websocket'

const router = useRouter()
const showDropdown = ref(false)
const userName = ref(localStorage.getItem('userName') || '用户')
const showPublicOpinion = ref(false)
const showWarning = ref(false)
const showAnalysis = ref(false)
const showDocument = ref(false)
const showSystem = ref(false)

// 未读数量（驱动小红点）
const unreadCount = ref(0)

// 定时轮询未读数（30秒一次）
let pollTimer = null
const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCountAPI()
    if (res.code === 1) unreadCount.value = res.data.unreadCount
  } catch (_) {}
}

onMounted(() => {
  fetchUnreadCount()
  pollTimer = setInterval(fetchUnreadCount, 30000)
  // 监听 WebSocket，收到 alert_message 时在右下角弹出浮动通知，5s 后自动关闭
  wsClient.onMessage((data) => {
    if (data.type === 'alert_message') {
      ElNotification({
        title: data.alert_name,
        message: data.content,
        type: 'warning',
        position: 'bottom-right',
        duration: 5000
      })
      fetchUnreadCount()
    }
  })
})

onBeforeUnmount(() => {
  clearInterval(pollTimer)
})

// 修改密码对话框
const showPasswordDialog = ref(false)
const passwordForm = ref({
  password: '',
  confirmPassword: ''
})

const togglePublicOpinion = () => {
  showPublicOpinion.value = !showPublicOpinion.value
}

const toggleWarning = () => {
  showWarning.value = !showWarning.value
}

const toggleAnalysis = () => {
  showAnalysis.value = !showAnalysis.value
}

const toggleDocument = () => {
  showDocument.value = !showDocument.value
}

const toggleSystem = () => {
  showSystem.value = !showSystem.value
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const refreshPermission = async () => {
  showDropdown.value = false
  try {
    const res = await refreshAuthorityAPI()
    if (res.code === 1) {
      ElMessage.success('权限已刷新')
    } else {
      ElMessage.error(res.msg || '刷新权限失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

const changePassword = () => {
  showDropdown.value = false
  showPasswordDialog.value = true
  passwordForm.value = {
    password: '',
    confirmPassword: ''
  }
}

const submitPasswordChange = async () => {
  if (!passwordForm.value.password) {
    ElMessage.warning('请输入新密码')
    return
  }

  if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  try {
    const res = await updateUserAPI({
      password: md5(passwordForm.value.password)
    })

    if (res.code === 1) {
      // 请求删除redis存储的token
      const res = await delTokenAPI({
        token: localStorage.getItem('token')
      })

      if(res.code === 1){
        //删除本地用户信息
        localStorage.removeItem('userName')
        localStorage.removeItem('userId')
        localStorage.removeItem('token')
        // 跳转登录页
        router.push('/login')
        ElMessage.success('密码修改成功,请重新登录！')

      } else {
        ElMessage.error(res.msg || '修改失败')
      }
    } 
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

const logout = async() => {
  showDropdown.value = false

  try{
    // 请求删除redis存储的token
    const res = await delTokenAPI({
      token: localStorage.getItem('token')
    })

    if(res.code === 1){
      // redis删除成功删除本地token
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('userId')
      // 跳转登录页
      router.push('/login')
      ElMessage.success("已退出登录！")

    } else {
      ElMessage.error(res.msg || '退出失败！')
    }

  }catch(err){
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.header {
  background: #ffffff;
  color: #333;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #f0f0f0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  transition: all 0.3s;
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.aside {
  width: 180px;
  background: #fafafa;
  color: #333;
  padding: 20px 0;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  overflow-x: hidden;
}

.aside::-webkit-scrollbar {
  width: 6px;
}

.aside::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.aside::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}

.aside::-webkit-scrollbar-track {
  background: transparent;
}
.aside a {
  display: block;
  padding: 12px 20px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  font-weight: 500;
}
.aside a:hover {
  background: #f0f0f0;
  color: #667eea;
  border-left-color: #667eea;
}
.aside a.router-link-active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
  color: #667eea;
  border-left-color: #667eea;
}

.menu-item {
  margin: 0;
}

.menu-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  font-weight: 500;
}

.menu-title:hover {
  background: #f0f0f0;
  color: #667eea;
}

.menu-arrow {
  transition: transform 0.3s;
  font-size: 14px;
}

.menu-arrow.is-expanded {
  transform: rotate(180deg);
}

.submenu {
  background: #f5f5f5;
  overflow: hidden;
}

.submenu a {
  padding: 10px 20px 10px 40px;
  font-size: 14px;
  font-weight: 400;
}

.submenu a:hover {
  background: #ebebeb;
}

.submenu a.router-link-active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, transparent 100%);
}

.submenu-with-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.submenu-badge {
  margin-left: auto;
}

.submenu-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 200px;
  opacity: 1;
}

.message-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  font-weight: 500;
}

.message-link:hover {
  background: #f0f0f0;
  color: #667eea;
  border-left-color: #667eea;
}

.message-link.router-link-active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
  color: #667eea;
  border-left-color: #667eea;
}

.message-badge {
  margin-left: auto;
}

.message-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: none;
}
.user-info {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s;
  color: #333;
}

.user-dropdown:hover {
  background: #f5f5f5;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dropdown-icon {
  transition: transform 0.3s;
}

.dropdown-icon.is-active {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: #333;
  cursor: pointer;
  transition: background 0.3s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item .el-icon {
  font-size: 16px;
}
.main {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow-y: auto;
}
</style>