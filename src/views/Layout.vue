<template>
  <div class="layout">
    <!-- 左侧菜单 -->
    <div class="aside">
      <h2>快爬</h2>
      <router-link to="/home">首页</router-link>
      <router-link to="/user">用户管理</router-link>
      <button @click="logout">退出</button>
    </div>

    <!-- 右侧内容区域 -->
    <div class="main">
      <!-- 子页面在这里显示！！！ -->
      <router-view />
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
  height: 100vh;
}
.aside {
  width: 200px;
  background: #222;
  color: white;
  padding: 20px;
}
.main {
  flex: 1;
  padding: 20px;
}
</style>