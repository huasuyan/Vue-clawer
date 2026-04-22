<template>
  <div class="register-container">
    <!-- 左侧品牌展示区 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-header">
          <img src="@/assets/logo.png" alt="Logo" class="brand-logo" />
          <h1 class="brand-title">淇安荣讯</h1>
        </div>
        <p class="brand-subtitle">全网舆情监测 · 实时数据分析</p>
        <img src="@/assets/u70.png" alt="Decoration" class="brand-decoration" />
      </div>
    </div>

    <!-- 右侧注册表单区 -->
    <div class="form-section">
      <div class="register-card">
        <h2 class="form-title">用户注册</h2>

        <div class="form-content">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名（6-12个字符）"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>

          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（6-18位，至少包含两种字符类型）"
            size="large"
            clearable
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>

          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            clearable
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>

          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>

          <div class="captcha-row">
            <el-input
              v-model="registerForm.code"
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

          <el-button type="primary" size="large" class="register-button" @click="handleRegister">
            注册
          </el-button>

          <div class="login-tip">
            已有账号？<span class="login-link" @click="goToLogin">立即登录</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCaptchaCodeAPI, registerAPI } from '@/api'
import { User, Lock, Iphone } from '@element-plus/icons-vue'
import md5 from 'js-md5'

const router = useRouter()

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  code: '',
  uuid: ''
})

const captchaImg = ref('')

const getCaptchaCode = async () => {
  try {
    const res = await getCaptchaCodeAPI()
    if (res.code === 1) {
      captchaImg.value = res.data.img
      registerForm.uuid = res.data.uuid
      registerForm.code = ''
    } else {
      ElMessage.error(res.msg || '获取验证码失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

const handleRegister = async () => {
  if (!registerForm.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (registerForm.username.length < 6 || registerForm.username.length > 12) {
    ElMessage.warning('用户名长度必须为6-12个字符')
    return
  }

  if (!registerForm.password) {
    ElMessage.warning('请输入密码')
    return
  }
  if (registerForm.password.length < 6 || registerForm.password.length > 18) {
    ElMessage.warning('密码长度必须为6-18位')
    return
  }
  const hasNumber = /\d/.test(registerForm.password)
  const hasLetter = /[a-zA-Z]/.test(registerForm.password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(registerForm.password)
  const typeCount = [hasNumber, hasLetter, hasSpecial].filter(Boolean).length
  if (typeCount < 2) {
    ElMessage.warning('密码必须包含数字、字母、特殊字符中的至少两种')
    return
  }

  if (!registerForm.confirmPassword) {
    ElMessage.warning('请确认密码')
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }
  if (!registerForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!registerForm.code) {
    ElMessage.warning('请输入验证码')
    return
  }

  try {
    const res = await registerAPI({
      username: registerForm.username,
      password: md5(registerForm.password),
      phone: registerForm.phone,
      code: registerForm.code,
      uuid: registerForm.uuid
    })

    if (res.code === 1) {
      ElMessage.success('注册成功，请登录')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(res.msg || '注册失败')
      getCaptchaCode()
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    getCaptchaCode()
    console.error(err)
  }
}

const goToLogin = () => {
  router.push('/login')
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

.register-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

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

.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.register-card {
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

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
  background: #4a90e2;
  border-color: #4a90e2;
}

.register-button:hover {
  background: #357abd;
  border-color: #357abd;
}

.login-tip {
  text-align: center;
  font-size: 14px;
  color: #666666;
  margin-top: 8px;
}

.login-link {
  color: #4a90e2;
  cursor: pointer;
  font-weight: 500;
  margin-left: 4px;
}

.login-link:hover {
  color: #357abd;
  text-decoration: underline;
}

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
</style>

