<template>
  <div class="public-opinion-search">
    <div class="search-header">
      <h2>专题检索</h2>
    </div>

    <div class="filter-panel">
      <div class="filter-row">
        <span class="filter-label">选择报告专题：</span>
        <el-select
          v-model="selectedReportId"
          placeholder="请选择报告专题"
          style="width: 350px"
          filterable
          clearable
        >
          <el-option
            v-for="item in reports"
            :key="item.specialReportId"
            :label="item.reportName"
            :value="item.specialReportId"
          />
        </el-select>
      </div>

      <div class="filter-actions">
        <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="result-panel">
      <div class="toolbar">
        <span class="result-count">共 {{ total }} 条结果</span>
      </div>

      <div class="result-list" v-loading="loading">
        <div v-if="articleList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无数据，请选择专题后查询" />
        </div>

        <div v-for="(item, index) in articleList" :key="item.newsId || index" class="record-item">
          <div class="item-main">
            <div class="item-title-row">
              <span class="item-title">{{ item.title }}</span>
              <div class="item-tags">
                <el-tag size="small" v-if="item.source" type="primary" effect="plain">{{ item.source }}</el-tag>
                <el-tag size="small" v-if="item.sensitivityLevel !== undefined" :type="sensitivityTagType(item.sensitivityLevel)" effect="plain">
                  {{ sensitivityLabel(item.sensitivityLevel) }}
                </el-tag>
                <el-tag size="small" v-if="item.sentimentType !== undefined" :type="sentimentTagType(item.sentimentType)" effect="plain">
                  {{ sentimentLabel(item.sentimentType) }}
                </el-tag>
                <el-tag size="small" v-if="item.region" type="primary" effect="plain">{{ item.region }}</el-tag>
              </div>
            </div>
            <div class="item-content">{{ item.content || '暂无内容摘要' }}</div>
            <div class="item-footer">
              <div class="footer-meta">
                <span v-if="item.publishTime">发文时间：{{ formatTime(item.publishTime) }}</span>
                <span v-if="item.region">地域：{{ item.region }}</span>
              </div>
              <div class="footer-actions">
                <el-button v-if="item.originalUrl" link type="primary" @click="openUrl(item.originalUrl)">查看原文</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getReportListAPI, getMonitorInfoListAPI } from '@/api'

const reports = ref([])
const selectedReportId = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const articleList = ref([])

const loadReports = async () => {
  try {
    const res = await getReportListAPI({ pageNum: 1, pageSize: 999 })
    if (res.code === 1) {
      reports.value = res.data?.reportList || []
    }
  } catch (err) {
    console.error('获取报告专题列表失败:', err)
  }
}

const handleSearch = async () => {
  if (!selectedReportId.value) {
    ElMessage.warning('请先选择报告专题')
    return
  }

  loading.value = true
  try {
    const res = await getMonitorInfoListAPI({
      reportId: selectedReportId.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (res.code === 1) {
      articleList.value = res.data?.datalist || []
      total.value = res.data?.total || articleList.value.length
    } else {
      ElMessage.error(res.msg || '查询失败')
      articleList.value = []
      total.value = 0
    }
  } catch (err) {
    console.error('专题检索失败:', err)
    ElMessage.error('网络异常，请重试')
    articleList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  selectedReportId.value = null
  currentPage.value = 1
  pageSize.value = 10
  articleList.value = []
  total.value = 0
}

// ==================== 辅助方法 ====================
const sensitivityTagType = (level) => {
  switch (level) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'danger'
    case 3: return 'danger'
    default: return 'info'
  }
}

const sensitivityLabel = (level) => {
  switch (level) {
    case 0: return '普通'
    case 1: return '低敏感'
    case 2: return '中敏感'
    case 3: return '高敏感'
    default: return '未知'
  }
}

const sentimentTagType = (type) => {
  switch (type) {
    case 1: return 'success'
    case 0: return 'info'
    case -1: return 'danger'
    default: return 'info'
  }
}

const sentimentLabel = (type) => {
  switch (type) {
    case 1: return '正面'
    case 0: return '中性'
    case -1: return '负面'
    default: return '未知'
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const openUrl = (url) => {
  window.open(url, '_blank')
}

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.public-opinion-search {
  padding: 0;
}

.search-header h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.filter-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.filter-label {
  min-width: 150px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.result-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.toolbar {
  padding: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.result-count {
  font-size: 14px;
  color: #666;
}

.result-list {
  padding: 15px;
  min-height: 200px;
}

.empty-state {
  padding: 60px 0;
}

.record-item {
  display: flex;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #fff;
  transition: box-shadow 0.3s;
}

.record-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.item-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.item-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.footer-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #909399;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  border-top: 1px solid #e8e8e8;
}
</style>
