<template>
  <div class="my-message">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">我的消息</h2>
      <div class="header-actions">
        <el-button v-if="hasUnread" @click="handleMarkAllRead">全部标为已读</el-button>
        <el-button v-if="hasRead" type="danger" @click="handleDeleteRead">删除已读</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="filterType" @change="handleFilterChange">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="unread">未读</el-radio-button>
        <el-radio-button label="read">已读</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <el-table :data="filteredList" style="width: 100%" @row-click="handleRowClick">
        <el-table-column width="50">
          <template #default="scope">
            <el-badge is-dot v-if="!scope.row.isRead" />
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)" size="small">{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button link type="primary" @click.stop="handleView(scope.row)">查看</el-button>
              <el-button link type="danger" @click.stop="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 消息详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="消息详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="消息类型">
          <el-tag :type="getTypeTag(currentMessage.type)" size="small">{{ getTypeText(currentMessage.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentMessage.title }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentMessage.createTime }}</el-descriptions-item>
        <el-descriptions-item label="内容">
          <div class="message-content">{{ currentMessage.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button v-if="!currentMessage.isRead" type="primary" @click="handleMarkRead">标为已读</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选类型
const filterType = ref('')

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 消息详情
const showDetailDialog = ref(false)
const currentMessage = ref({})

// 模拟消息数据
const messageList = ref([
  {
    id: 1,
    type: 'warning',
    title: '【预警】检测到敏感舆情信息',
    content: '系统检测到关于"某企业"的负面舆情信息，请及时关注处理。关键词：产品质量问题、用户投诉。',
    isRead: false,
    createTime: '2024-01-15 14:30:00'
  },
  {
    id: 2,
    type: 'report',
    title: '【报告】每日舆情报告已生成',
    content: '您的定时报告"行业监测"已生成，请前往舆情报告页面查看详细内容。',
    isRead: false,
    createTime: '2024-01-15 09:00:00'
  },
  {
    id: 3,
    type: 'system',
    title: '系统通知：账号安全提醒',
    content: '您的账号于 2024-01-15 10:30:00 在新设备登录，如非本人操作，请及时修改密码。',
    isRead: false,
    createTime: '2024-01-15 10:35:00'
  },
  {
    id: 4,
    type: 'alert',
    title: '【告警】爬虫任务执行失败',
    content: '爬虫任务"竞品数据采集"于 2024-01-14 18:00:00 执行失败，错误信息：目标网站访问超时。请检查配置后重试。',
    isRead: true,
    createTime: '2024-01-14 18:05:00'
  },
  {
    id: 5,
    type: 'warning',
    title: '【预警】舆情热度上升提醒',
    content: '监测专题"政策解读"下的关键词"新规"热度大幅上升，当前情感倾向偏负面，建议关注。',
    isRead: true,
    createTime: '2024-01-13 16:20:00'
  },
  {
    id: 6,
    type: 'report',
    title: '【报告】周度舆情分析报告',
    content: '2024年第2周舆情分析报告已生成，共监测到相关舆情 128 条，正面 45%，中性 38%，负面 17%。',
    isRead: true,
    createTime: '2024-01-13 08:00:00'
  },
  {
    id: 7,
    type: 'system',
    title: '系统通知：配置变更确认',
    content: '您修改的预警配置已保存生效，修改内容：预警专题"品牌监测"启用状态变更为启用。',
    isRead: true,
    createTime: '2024-01-12 15:40:00'
  },
  {
    id: 8,
    type: 'alert',
    title: '【告警】存储空间不足预警',
    content: '服务器存储空间使用率已达 85%，请及时清理历史数据或扩展存储空间。',
    isRead: true,
    createTime: '2024-01-11 11:00:00'
  }
])

// 筛选后的列表
const filteredList = computed(() => {
  if (!filterType.value) return messageList.value
  return messageList.value.filter(m =>
    filterType.value === 'unread' ? !m.isRead : m.isRead
  )
})

// 未读数量
const hasUnread = computed(() => messageList.value.some(m => !m.isRead))
const hasRead = computed(() => messageList.value.some(m => m.isRead))
const unreadCount = computed(() => messageList.value.filter(m => !m.isRead).length)

// 同步未读数量到 localStorage
watch(unreadCount, (newVal) => {
  localStorage.setItem('unreadMessageCount', newVal.toString())
  // 触发事件通知 Layout 刷新（同一页面内）
  window.dispatchEvent(new Event('unreadMessageCountChanged'))
}, { immediate: true })

// 获取类型标签颜色
const getTypeTag = (type) => {
  const typeMap = {
    'warning': 'warning',
    'report': 'success',
    'system': 'info',
    'alert': 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    'warning': '预警',
    'report': '报告',
    'system': '系统',
    'alert': '告警'
  }
  return typeMap[type] || '其他'
}

// 筛选变化
const handleFilterChange = () => {
  pagination.value.currentPage = 1
}

// 行点击
const handleRowClick = (row) => {
  if (!row.isRead) {
    row.isRead = true
  }
}

// 查看详情
const handleView = (row) => {
  currentMessage.value = { ...row }
  if (!row.isRead) {
    row.isRead = true
  }
  showDetailDialog.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = messageList.value.findIndex(m => m.id === row.id)
    if (index !== -1) {
      messageList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 全部标为已读
const handleMarkAllRead = () => {
  ElMessageBox.confirm('确定要将所有消息标为已读吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    messageList.value.forEach(m => { m.isRead = true })
    ElMessage.success('已全部标为已读')
  }).catch(() => {})
}

// 删除已读
const handleDeleteRead = () => {
  ElMessageBox.confirm('确定要删除所有已读消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    messageList.value = messageList.value.filter(m => !m.isRead)
    ElMessage.success('已删除所有已读消息')
  }).catch(() => {})
}

// 标为已读
const handleMarkRead = () => {
  const index = messageList.value.findIndex(m => m.id === currentMessage.value.id)
  if (index !== -1) {
    messageList.value[index].isRead = true
    currentMessage.value.isRead = true
  }
  showDetailDialog.value = false
  ElMessage.success('已标为已读')
}

// 暴露未读数量给父组件
defineExpose({ unreadCount })
</script>

<style scoped>
.my-message {
  background: white;
  padding: 20px;
  border-radius: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-bar {
  margin-bottom: 20px;
}

.message-list {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.message-content {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>