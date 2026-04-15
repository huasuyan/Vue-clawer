<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <div class="header">
      <h1>任务调度中心</h1>
      <div class="user-info">
        <span>欢迎：NT0777</span>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 左侧菜单 -->
      <div class="aside">
        <router-link to="/overview">运行概览</router-link>
        <router-link to="/task">任务管理</router-link>
        <router-link to="/execution">执行管理</router-link>
        <router-link to="/log">调度日志</router-link>
        <router-link to="/user">用户管理</router-link>
        <button @click="logout">退出</button>
      </div>

      <!-- 右侧内容区域 -->
      <div class="main">
        <!-- 子页面在这里显示！！！ -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { delTokenAPI } from '@/api'
import { ElMessage } from 'element-plus'
const router = useRouter()

const logout = async() => {
  
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
.aside button {
  margin: 20px;
  width: calc(100% - 40px);
  padding: 10px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.main {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow-y: auto;
}
</style>