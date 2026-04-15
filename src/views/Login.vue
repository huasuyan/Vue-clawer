<template>
  <!-- 背景容器 -->
  <div class="login-container">
    <!-- 登录框 -->
    <div class="login-box">
      <h2 class="login-title">用户登录</h2>

      <!-- 登录方式切换 -->
      <div class="tab-container">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'account' }"
          @click="activeTab = 'account'"
        >
          账号密码登录
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'sms' }"
          @click="activeTab = 'sms'"
        >
          短信验证码登录
        </div>
      </div>

      <!-- 账号密码登录表单 -->
      <div v-show="activeTab === 'account'" class="form-container">
        <el-input
          v-model="accountForm.username"
          placeholder="请输入账号"
          clearable
          class="form-input"
        />
        <el-input
          v-model="accountForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
          class="form-input"
        />
        <div class="captcha-row">
          <el-input
            v-model="accountForm.code"
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
        <el-button type="primary" class="login-btn" @click="handleAccountLogin">
          登录
        </el-button>
        <div class="register-link">
          还没有账号？<span @click="goToRegister">立即注册</span>
        </div>
      </div>

      <!-- 短信验证码登录表单 -->
      <div v-show="activeTab === 'sms'" class="form-container">
        <el-input
          v-model="smsForm.phone"
          placeholder="请输入手机号"
          clearable
          class="form-input"
        />
        <div class="captcha-row">
          <el-input
            v-model="smsForm.code"
            placeholder="短信验证码"
            clearable
            class="captcha-input"
          />
          <el-button
            type="primary"
            :disabled="countDown > 0"
            class="sms-btn"
            @click="sendSmsCode"
          >
            {{ countDown > 0 ? `${countDown}s后重发` : '获取验证码' }}
          </el-button>
        </div>
        <el-button type="primary" class="login-btn" @click="handleSmsLogin">
          登录
        </el-button>
        <div class="register-link">
          还没有账号？<span @click="goToRegister">立即注册</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCaptchaCodeAPI, loginAPI , codeLoginAPI, getSmsCodeAPI } from '@/api'
import md5 from 'js-md5'

// 登录方式切换
const activeTab = ref('account')

// 账号密码登录表单
const accountForm = reactive({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

// 短信登录表单
const smsForm = reactive({
  phone: '',
  code: '',
  uuid:''
})

// 图形验证码相关
const captchaImg = ref('')
const captchaUuid = ref('')

// 短信倒计时
const countDown = ref(0)
let timer = null

// 获取图形验证码

const getCaptchaCode = async () => {
  try {
    const res = await getCaptchaCodeAPI()
    if (res.code === 1) {
      captchaImg.value = res.data.img
      captchaUuid.value = res.data.uuid
      accountForm.uuid = res.data.uuid
    } else {
      ElMessage.error(res.msg || '获取验证码失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
  }
}

// 账号密码登录
const handleAccountLogin = async () => {
  if (!accountForm.username) {
    ElMessage.warning('请输入账号')
    return
  }
  if (!accountForm.password) {
    ElMessage.warning('请输入密码')
    return
  }
  if (!accountForm.code) {
    ElMessage.warning('请输入图形验证码')
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
      // 保存 token 到本地存储
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('username',accountForm.username)
        // 这里可以跳转到首页
        router.push('/home')
      }
     
    } else {
      ElMessage.error(res.msg || '登录失败')
      // 登录失败后刷新验证码
      getCaptchaCode()
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
    // 登录失败后刷新验证码
    getCaptchaCode()
  }
}

// 发送短信验证码
const sendSmsCode = async () => {
  if (!smsForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }

  // 验证手机号格式
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(smsForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    // 调用接口发送短信
    const res = await getSmsCodeAPI(
      smsForm.phone
    )

    if (res.code === 1) {
      ElMessage.success('验证码已发送')
      smsForm.uuid = res.data.uuid
      // 启动倒计时
      countDown.value = 60
      timer = setInterval(() => {
        countDown.value--
        if (countDown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(res.msg || '发送失败，请重试')
    }
  } catch (err) {
    console.error('发送短信验证码异常：', err)
    ElMessage.error('网络异常，请重试')
  }
}

// 短信验证码登录
const handleSmsLogin = async () => {
  // 1. 校验非空
  if (!smsForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (!smsForm.code) {
    ElMessage.warning('请输入短信验证码')
    return
  }

  try {
    // 2. 请求后端短信登录接口
    const res = await codeLoginAPI({
       phone: smsForm.phone,
       code:  smsForm.code,
       uuid:  smsForm.uuid
    })

    
    
    // 3. 登录成功
    if (res.code === 1) {
      ElMessage.success('登录成功')

      // 4. 保存 token（必须！）
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
      }

      // 5. 跳转到主页
      router.push('/home')
    } else {
      // 失败提示
      ElMessage.error(res.msg || '登录失败，请重试')
    }
  } catch (err) {
    console.error('短信登录异常：', err)
    ElMessage.error('网络异常或验证码错误')
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptchaCode()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* 背景容器 */
.login-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 登录框 */
.login-box {
  position: absolute;
  right: 15%; /* 右侧75%位置，即距离右边25% */
  top: 50%;
  transform: translateY(-50%); /* 上下居中 */
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.5); /* 透明度50% */
  border-radius: 12px;
  backdrop-filter: blur(10px); /* 毛玻璃效果，增强质感 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 标题 */
.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 500;
}

/* 切换栏 */
.tab-container {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
}

.tab-item.active {
  color: #409eff;
  font-weight: 500;
  border-bottom: 2px solid #409eff;
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

/* 短信按钮 */
.sms-btn {
  height: 48px;
  white-space: nowrap;
  border-radius: 8px;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 10px;
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.register-link span {
  color: #409eff;
  cursor: pointer;
  margin-left: 5px;
}

.register-link span:hover {
  text-decoration: underline;
}
</style>