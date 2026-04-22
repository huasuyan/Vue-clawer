<template>
  <div class="public-opinion-search">
    <div class="search-header">
      <h2>选择舆情报告专题ID</h2>
    </div>

    <!-- 筛选条件面板 -->
    <div class="filter-panel">
      <div class="filter-row">
        <span class="filter-label">舆情报告专题ID：</span>
        <el-input
          v-model="specialReportId"
          placeholder="请输入舆情报告专题ID"
          style="width: 300px;"
          clearable
        />
      </div>

      <div class="filter-actions">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 结果列表 -->
    <div class="result-panel">
      <div class="toolbar">
        <span class="result-count">共 {{ total }} 条结果</span>
      </div>

      <div class="result-list" v-loading="loading">
        <div v-if="newsList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无数据，请输入舆情报告专题ID进行查询" />
        </div>

        <div v-for="item in newsList" :key="item.id" class="result-item">
          <div class="item-header">
            <span class="item-title">{{ item.title || '无标题' }}</span>
          </div>
          <div class="item-content" v-if="item.content">
            {{ item.content.substring(0, 200) }}{{ item.content.length > 200 ? '...' : '' }}
          </div>
          <div class="item-meta">
            <span v-if="item.source">来源：{{ item.source }}</span>
            <span v-if="item.author">作者：{{ item.author }}</span>
            <span v-if="item.publishTime">发布时间：{{ item.publishTime }}</span>
            <span v-if="item.url">
              <a :href="item.url" target="_blank" class="link">查看原文</a>
            </span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const specialReportId = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const newsList = ref([])

const handleSearch = async () => {
  if (!specialReportId.value) {
    ElMessage.warning('请输入舆情报告专题ID')
    return
  }

  loading.value = true
  try {
    const response = await axios.get('/api/v1/specialReport/searchAllReportNews', {
      params: {
        special_report_id: specialReportId.value,
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })

    if (response.data.code === 1) {
      newsList.value = response.data.data.dataList || []
      total.value = response.data.data.total || newsList.value.length
      ElMessage.success('查询成功')
    } else {
      ElMessage.error(response.data.msg || '查询失败')
      newsList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('网络异常，请重试')
    newsList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  specialReportId.value = ''
  currentPage.value = 1
  pageSize.value = 10
  newsList.value = []
  total.value = 0
}
</script>

<style scoped>
.public-opinion-search {
  padding: 20px;
  background: #fff;
}

.search-header h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.filter-panel {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.filter-label {
  min-width: 150px;
  color: #666;
  font-size: 14px;
}


.filter-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.result-panel {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
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
  padding: 40px 0;
}

.result-item {
  padding: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-header {
  margin-bottom: 10px;
}

.item-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.item-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.item-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #999;
  flex-wrap: wrap;
}

.link {
  color: #1890ff;
  text-decoration: none;
}

.link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  border-top: 1px solid #e8e8e8;
}
</style>
