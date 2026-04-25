import { createApp } from 'vue'
import App from './App.vue'
import wsClient from './utils/websocket'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import router from "./router"


const app = createApp(App)
app.config.globalProperties.$ws = wsClient
app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.mount('#app')


wsClient.connect()
