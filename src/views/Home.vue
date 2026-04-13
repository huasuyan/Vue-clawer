<template>
  <div class="home">
    <h1>🏠 首页</h1>
    <p>登录成功！欢迎进入后台管理系统</p>
    <p>当前 token：{{ token }}</p>
  </div>
</template>

<script setup>
const token = localStorage.getItem('token')
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>