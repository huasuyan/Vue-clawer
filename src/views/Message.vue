<template>
  <div class="message-page">
    <div class="page-header">
      <h2>我的消息</h2>
      <div class="header-actions">
        <el-button size="small" @click="fetchMessages">刷新</el-button>
        <el-button size="small" type="warning" @click="handleMarkAllRead" :disabled="total === 0">全部已读</el-button>
      </div>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="onlyUnread" @change="handleFilterChange">
        <el-radio-button :value="false">全部</el-radio-button>
        <el-radio-button :value="true">未读 ({{ unreadCount }})</el-radio-button>
      </el-radio-group>
      <el-button size="small" @click="handleBatchRead" :disabled="selectedIds.length === 0" style="margin-left:16px;">
        批量标记已读
      </el-button>
    </div>

    <div class="message-list" v-loading="loading">
      <div v-if="messageList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无消息" />
      </div>

      <div
        v-for="(item, index) in messageList"
        :key="item.messageId"
        class="message-card"
        :class="{ 'is-unread': item.isRead === 0 }"
      >
        <span class="card-index">{{ (pageNum - 1) * pageSize + index + 1 }}</span>
        <el-checkbox
          v-model="selectedIds"
          :label="item.messageId"
          @change="() => {}"
          style="margin-right: 12px;"
        />
        <div class="card-body">
          <div class="card-header">
            <span class="card-title">{{ item.alertName }}</span>
            <el-tag v-if="item.isRead === 0" size="small" type="danger" effect="dark">未读</el-tag>
          </div>
          <div class="card-content">{{ item.content }}</div>
          <div class="card-footer">
            <span class="card-time">{{ item.createTime }}</span>
            <el-button
              v-if="item.isRead === 0"
              link
              type="primary"
              size="small"
              @click="handleMarkRead(item)"
            >
              标记已读
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="fetchMessages"
        @current-change="fetchMessages"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getUnreadCountAPI,
  getMessageListAPI,
  markReadAPI,
  batchMarkReadAPI,
  markAllReadAPI
} from '@/api'

const messageList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const onlyUnread = ref(false)
const unreadCount = ref(0)
const selectedIds = ref([])

const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCountAPI()
    if (res.code === 1) unreadCount.value = res.data.unreadCount
  } catch (_) {}
}

const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await getMessageListAPI({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      onlyUnread: onlyUnread.value
    })
    if (res.code === 1) {
      messageList.value = res.data?.list || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '获取消息列表失败')
    }
  } catch (_) {
    ElMessage.error('网络异常，请重试')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pageNum.value = 1
  fetchMessages()
}

const handleMarkRead = async (item) => {
  const res = await markReadAPI({ messageId: item.messageId })
  if (res.code === 1) {
    item.isRead = 1
    await fetchUnreadCount()
  }
}

const handleBatchRead = async () => {
  if (selectedIds.value.length === 0) return
  const res = await batchMarkReadAPI({ messageIds: selectedIds.value })
  if (res.code === 1) {
    selectedIds.value = []
    await fetchMessages()
    await fetchUnreadCount()
    ElMessage.success('已标记已读')
  }
}

const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm('确定将所有消息标记为已读？', '提示', { type: 'warning' })
    const res = await markAllReadAPI()
    if (res.code === 1) {
      await fetchMessages()
      await fetchUnreadCount()
      ElMessage.success('已全部标记已读')
    }
  } catch (_) {}
}

onMounted(() => {
  fetchMessages()
  fetchUnreadCount()
})
</script>

<style scoped>
.message-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.filter-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.message-list {
  background: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  min-height: 300px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.empty-state {
  padding: 80px 0;
}

.message-card {
  display: flex;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.message-card:hover {
  background: #fafafa;
}

.message-card.is-unread {
  background: #f0f7ff;
}

.message-card.is-unread:hover {
  background: #e6f0ff;
}

.card-index {
  min-width: 32px;
  font-size: 14px;
  color: #909399;
  text-align: center;
  line-height: 36px;
  margin-right: 8px;
}

/* 隐藏 el-checkbox 默认显示的 label 文字（messageId） */
.message-card :deep(.el-checkbox__label) {
  display: none;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.card-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 12px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
