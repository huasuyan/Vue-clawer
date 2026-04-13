<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="register-title">用户注册</h2>

      <div class="form-container">
        <el-input
          v-model="registerForm.username"
          placeholder="请输入账号（6-12个字符）"
          clearable
          class="form-input"
        />
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码（6-18位，至少包含两种字符类型）"
          show-password
          clearable
          class="form-input"
        />
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请确认密码"
          show-password
          clearable
          class="form-input"
        />
        <el-input
          v-model="registerForm.phone"
          placeholder="请输入手机号"
          clearable
          class="form-input"
        />
        <div class="captcha-row">
          <el-input
            v-model="registerForm.code"
            placeholder="图形验证码"
            clearable
            class="captcha-input"
          />
          <img
            :src="`data:image/png;base64,${captchaImg}`"
            @click="getCaptchaCode"
            class="captcha-img"
            alt="图形验证码"
          />
        </div>

        <el-button type="primary" class="register-btn" @click="handleRegister">
          注册
        </el-button>
        <div class="login-link">
          已有账号？<span @click="goToLogin">立即登录</span>
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
import md5 from 'js-md5'


const router = useRouter()

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  code: '',
  uuid: ''
})

// 图形验证码
const captchaImg = ref('')
const captchaUuid = ref('')

// 获取图形验证码
const getCaptchaCode = async () => {
  try {
    const res = await getCaptchaCodeAPI()
    if (res.code === 1) {
      captchaImg.value = res.data.img
      captchaUuid.value = res.data.uuid
      registerForm.uuid = res.data.uuid
    } else {
      ElMessage.error(res.msg || '获取验证码失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
  }
}

// 注册
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.username) {
    ElMessage.warning('请输入账号')
    return
  }
  // 验证账号长度
  if (registerForm.username.length < 6 || registerForm.username.length > 12) {
    ElMessage.warning('账号长度必须为6-12个字符')
    return
  }

  if (!registerForm.password) {
    ElMessage.warning('请输入密码')
    return
  }
  // 验证密码长度
  if (registerForm.password.length < 6 || registerForm.password.length > 18) {
    ElMessage.warning('密码长度必须为6-18位')
    return
  }
  // 验证密码复杂度：至少包含数字、大小写字母、特殊字符中的两种
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
    ElMessage.warning('请输入图形验证码')
    return
  }

  try {
    // 调用注册接口
    const res = await registerAPI({
      username: registerForm.username,
      password: md5(registerForm.password),
      phone: registerForm.phone,
      code: registerForm.code,
      uuid: registerForm.uuid
    })

    if (res.code === 1) {
      ElMessage.success('注册成功，请登录')
      // 跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(res.msg || '注册失败')
      // 注册失败后刷新验证码
      getCaptchaCode()
    }
  } catch (err) {
    console.error('注册异常：', err)
    ElMessage.error('网络异常，请重试')
    // 注册失败后刷新验证码
    getCaptchaCode()
  }
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  getCaptchaCode()
})
</script>



<style scoped>
/* 背景容器 */
.register-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 注册框 */
.register-box {
  position: absolute;
  right: 25%;
  top: 50%;
  transform: translateY(-50%);
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 标题 */
.register-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 500;
}

/* 表单容器 */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 输入框 */
.form-input {
  height: 48px;
  border-radius: 8px;
}

/* 验证码行 */
.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.captcha-input {
  flex: 1;
  height: 48px;
  border-radius: 8px;
}

/* 验证码图片 */
.captcha-img {
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 10px;
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.login-link span {
  color: #409eff;
  cursor: pointer;
  margin-left: 5px;
}

.login-link span:hover {
  text-decoration: underline;
}
</style>