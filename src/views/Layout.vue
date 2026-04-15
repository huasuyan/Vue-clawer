<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="logo">
        <div class="logo-icon">
          <img src="@/assets/logo.png" alt="Logo" class="logo-image" />
        </div>
        <span class="logo-text">快爬</span>
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
        <router-link to="/home">运行概览</router-link>
        <router-link to="/task">爬虫管理</router-link>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { delTokenAPI, updateUserAPI } from '@/api'
import { ElMessage } from 'element-plus'
import { ArrowDown, Refresh, Edit, Close } from '@element-plus/icons-vue'
import md5 from 'js-md5'

const router = useRouter()
const showDropdown = ref(false)
const userName = ref(localStorage.getItem('username') || '用户')

// 修改密码对话框
const showPasswordDialog = ref(false)
const passwordForm = ref({
  password: '',
  confirmPassword: ''
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const refreshPermission = () => {
  showDropdown.value = false
  ElMessage.success('权限已刷新')
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
        localStorage.removeItem('username')
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
  background: #1890ff;
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
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
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s;
}

.logo-icon:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 2px;
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
  background: #262626;
  color: white;
  padding: 20px 0;
}
.aside a {
  display: block;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
}
.aside a:hover {
  background: #1890ff;
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
  border-radius: 4px;
  transition: background 0.3s;
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #262626;
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