<template>
  <div class="log-container">
    <h2>调度日志</h2>
    <div class="search-area">
      <el-input v-model="searchKey" placeholder="搜索日志" style="width: 300px; margin-right: 10px;"></el-input>
      <el-button type="primary" @click="search">搜索</el-button>
    </div>
    <div class="log-content">
      <el-scrollbar style="height: 500px;">
        <div v-for="(log, index) in logList" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-level" :class="log.level">{{ log.level }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchKey = ref('')
const logList = ref([
  { time: '2026-04-14 10:00:00', level: 'info', message: '任务调度开始' },
  { time: '2026-04-14 10:00:01', level: 'info', message: '执行任务ID: 1' },
  { time: '2026-04-14 10:00:02', level: 'success', message: '任务执行成功' },
  { time: '2026-04-14 10:00:03', level: 'info', message: '任务调度结束' }
])

const search = () => {
  console.log('Search log:', searchKey.value)
}
</script>

<style scoped>
.log-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-area {
  margin-bottom: 20px;
}

.log-content {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 10px;
}

.log-item {
  margin-bottom: 10px;
  padding: 5px 10px;
  background: white;
  border-radius: 4px;
}

.log-time {
  display: inline-block;
  width: 180px;
  color: #909399;
}

.log-level {
  display: inline-block;
  width: 80px;
  text-align: center;
  border-radius: 10px;
  font-size: 12px;
  padding: 2px 8px;
  margin-right: 10px;
}

.log-level.info {
  background: #ecf5ff;
  color: #409eff;
}

.log-level.success {
  background: #f0f9eb;
  color: #67c23a;
}

.log-level.error {
  background: #fef0f0;
  color: #f56c6c;
}

.log-message {
  color: #303133;
}
</style>