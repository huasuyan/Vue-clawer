<template>
  <div class="login-container">
    <!-- 左侧品牌展示区 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-header">
          <img src="@/assets/logo2.jpeg" alt="Logo" class="brand-logo" />
          <h1 class="brand-title">淇安荣讯</h1>
        </div>
        <p class="brand-subtitle">全网舆情监测 · 实时数据分析</p>
        <img src="@/assets/u70.png" alt="Decoration" class="brand-decoration" />
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="form-section">
      <div class="login-card">
        <h2 class="form-title">用户登录</h2>

        <div class="form-content">
          <el-input
            v-model="accountForm.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>

          <el-input
            v-model="accountForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>

          <div class="captcha-row">
            <el-input
              v-model="accountForm.code"
              placeholder="请输入验证码"
              size="large"
              clearable
            />
            <img
              :src="`data:image/png;base64,${captchaImg}`"
              @click="getCaptchaCode"
              class="captcha-img"
              alt="验证码"
            />
          </div>

          <div class="form-options">
            <el-checkbox v-model="showPassword">显示密码</el-checkbox>
            <span class="forgot-link" @click="handleForgetPassword">忘记密码？</span>
          </div>

          <el-button type="primary" size="large" class="login-button" @click="handleAccountLogin">
            登录
          </el-button>

          <div class="register-tip">
            还没有账号？<span class="register-link" @click="goToRegister">立即注册</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCaptchaCodeAPI, loginAPI } from '@/api'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import md5 from 'js-md5'

const router = useRouter()

const accountForm = reactive({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

const showPassword = ref(false)
const captchaImg = ref('')

const getCaptchaCode = async () => {
  try {
    const res = await getCaptchaCodeAPI()
    if (res.code === 1) {
      captchaImg.value = res.data.img
      accountForm.uuid = res.data.uuid
      accountForm.code = ''
    } else {
      ElMessage.error(res.msg || '获取验证码失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

const handleAccountLogin = async () => {
  if (!accountForm.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!accountForm.password) {
    ElMessage.warning('请输入密码')
    return
  }
  if (!accountForm.code) {
    ElMessage.warning('请输入验证码')
    return
  }

  try {
    const res = await loginAPI({
      username: accountForm.username,
      password: md5(accountForm.password),
      code: accountForm.code,
      uuid: accountForm.uuid
    })

    if (res.code === 1) {
      ElMessage.success('登录成功')
      // 保存token和用户信息
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token)
        // 兼容不同的返回数据结构
        if (res.data.userInfo) {
          localStorage.setItem('userName', res.data.userInfo.userName)
          localStorage.setItem('userId', res.data.userInfo.userId)
        } else {
          localStorage.setItem('userName', res.data.userName || accountForm.username)
          localStorage.setItem('userId', res.data.userId || '')
        }
      }
      // 延迟跳转，确保数据保存完成
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } else {
      ElMessage.error(res.msg || '登录失败')
      getCaptchaCode()
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    getCaptchaCode()
    console.error(err)
  }
}

const handleForgetPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}

const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  getCaptchaCode()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 左侧品牌区 */
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.brand-content {
  text-align: center;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.brand-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.brand-logo {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.brand-title {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #ffffff;
  margin: 0;
}

.brand-subtitle {
  font-size: 18px;
  font-weight: 400;
  color: #ffffff;
  letter-spacing: 2px;
  margin-bottom: 40px;
}

.brand-decoration {
  max-width: 400px;
  width: 100%;
  height: auto;
  object-fit: contain;
  margin-top: 20px;
}

/* 右侧表单区 */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.form-title {
  font-size: 26px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 36px;
  text-align: center;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.captcha-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.captcha-img {
  width: 120px;
  height: auto;
  min-height: 40px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  object-fit: cover;
  align-self: stretch;
}

.captcha-img:hover {
  border-color: #409eff;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.forgot-link {
  color: #4a90e2;
  cursor: pointer;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: #357abd;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
  background: #4a90e2;
  border-color: #4a90e2;
}

.login-button:hover {
  background: #357abd;
  border-color: #357abd;
}

.register-tip {
  text-align: center;
  font-size: 14px;
  color: #666666;
  margin-top: 8px;
}

.register-link {
  color: #4a90e2;
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
}

.register-link:hover {
  color: #357abd;
  text-decoration: underline;
}

/* Element Plus 样式覆盖 */
:deep(.el-input__wrapper) {
  padding: 10px 15px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  background: rgba(255, 255, 255, 0.9);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #4a90e2 inset !important;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #666666;
}
</style>
