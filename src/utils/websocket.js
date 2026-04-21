// WebSocket 全局封装
const WS_BASE_URL = 'ws://localhost:8080/ws/vue' // 你的SpringBoot地址

class WebSocketClient {
  constructor() {
    this.ws = null
    this.reconnectTimer = null
    // 消息回调订阅池
    this.messageHandlers = []
  }

  // 建立连接
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    // 自动带上 localStorage userId
    const userId = localStorage.getItem('userId')
    this.ws = new WebSocket(WS_BASE_URL, [userId])

    // 连接成功
    this.ws.onopen = () => {
      console.log('✅ WebSocket 连接成功')
      // 清除重连定时器
      clearTimeout(this.reconnectTimer)
    }

    // 接收后端推送消息
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // 执行所有注册的回调
        this.messageHandlers.forEach(cb => cb(data))
      } catch (e) {
        console.log('非JSON消息：', event.data)
      }
    }

    // 连接关闭
    this.ws.onclose = () => {
      console.log('❌ WebSocket 连接断开，3秒后自动重连')
      this.reconnect()
    }

    // 连接报错
    this.ws.onerror = (err) => {
      console.error('❌ WebSocket 错误：', err)
    }
  }

  // 自动断线重连
  reconnect() {
    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, 3000)
  }

  // 发送消息给后端
  send(msgObj) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msgObj))
    }
  }

  // 订阅消息回调（组件用来接收推送）
  onMessage(callback) {
    this.messageHandlers.push(callback)
  }

  // 手动关闭连接
  close() {
    clearTimeout(this.reconnectTimer)
    this.ws?.close()
  }
}

// 全局唯一实例导出
export default new WebSocketClient()