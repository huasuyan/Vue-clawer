<template>
  <div class="monitor-page">
    <!-- ========== 筛选条件面板 ========== -->
    <div class="filter-panel">
      <div class="filter-row">
        <span class="filter-label">时间范围：</span>
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button value="today">今日</el-radio-button>
          <el-radio-button value="week">近七天</el-radio-button>
          <el-radio-button value="month">近三十天</el-radio-button>
          <el-radio-button value="custom">自选日期</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-if="timeRange === 'custom'"
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="margin-left: 12px; width: 260px"
        />
      </div>

      <div class="filter-row">
        <span class="filter-label">信息属性：</span>
        <el-checkbox-group v-model="sensitivityLevel">
          <el-checkbox value="0">普通</el-checkbox>
          <el-checkbox value="1">低敏感</el-checkbox>
          <el-checkbox value="2">中敏感</el-checkbox>
          <el-checkbox value="3">高敏感</el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="filter-row">
        <span class="filter-label">文章来源：</span>
        <el-select v-model="source" placeholder="请选择目标来源" style="width: 200px">
          <el-option label="默认（综合）" value="default" />
        </el-select>
        <span class="filter-label" style="margin-left: 20px">地域：</span>
        <el-input v-model="region" placeholder="请输入地域" style="width: 200px" clearable />
      </div>

      <div class="filter-row">
        <span class="filter-label">关键词搜索：</span>
        <el-input
          v-model="keyword"
          placeholder="输入关键词，将匹配预警/报告专题中的词组"
          style="width: 400px"
          clearable
        />
      </div>

      <div class="filter-actions">
        <el-button type="primary" @click="handleSearch" :loading="loading">
          查询
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- ========== 选项卡区域 ========== -->
    <div class="tab-panel">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- -------- Tab 1: 文章监测 -------- -->
        <el-tab-pane label="文章监测" name="article">
          <div class="toolbar">
            <span class="result-count">共 {{ articleTotal }} 条结果</span>
            <el-button type="success" @click="switchToStatistics" :disabled="articleList.length === 0">
              统计图表
            </el-button>
          </div>
          <el-table :data="articleList" v-loading="loading" stripe style="width: 100%">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="title" label="标题" min-width="250" show-overflow-tooltip />
            <el-table-column prop="source" label="来源" width="120" />
            <el-table-column prop="publishTime" label="发布时间" width="110" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewArticleDetail(row)">查看</el-button>
                <el-button v-if="row.url" link type="primary" @click="openUrl(row.url)">原文</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && articleList.length === 0" description="暂无数据，请设置筛选条件后点击查询" />
          <div class="pagination" v-if="articleTotal > 0">
            <el-pagination
              v-model:current-page="articlePageNum"
              v-model:page-size="articlePageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="articleTotal"
              @size-change="handleSearch"
              @current-change="handleSearch"
            />
          </div>
        </el-tab-pane>

        <!-- -------- Tab 2: 统计图表 -------- -->
        <el-tab-pane label="统计图表" name="statistics">
          <div v-if="articleList.length > 0" class="charts-container">
            <div class="chart-row">
              <div class="chart-card">
                <h3 class="chart-title">文章来源分布</h3>
                <div ref="sourceChartRef" class="chart-box"></div>
              </div>
              <div class="chart-card">
                <h3 class="chart-title">发布时间趋势</h3>
                <div ref="trendChartRef" class="chart-box"></div>
              </div>
            </div>
            <div class="chart-row">
              <div class="chart-card">
                <h3 class="chart-title">敏感等级分布</h3>
                <div ref="sensitivityChartRef" class="chart-box"></div>
              </div>
              <div class="chart-card">
                <h3 class="chart-title">情感极性分布</h3>
                <div ref="sentimentChartRef" class="chart-box"></div>
              </div>
            </div>
          </div>
          <el-empty v-else description="请先在「文章监测」中查询数据" />
        </el-tab-pane>

        <!-- -------- Tab 3: 专题检索 -------- -->
        <el-tab-pane label="专题检索" name="report">
          <div class="filter-row">
            <span class="filter-label">选择专题：</span>
            <el-select
              v-model="selectedReportId"
              placeholder="请选择预警或报告专题"
              style="width: 350px"
              filterable
              clearable
            >
              <el-option-group label="— 预警专题 —">
                <el-option
                  v-for="item in alertInfos"
                  :key="'alert_' + item.reportId"
                  :label="item.reportName"
                  :value="item.reportId"
                />
              </el-option-group>
              <el-option-group label="— 报告专题 —">
                <el-option
                  v-for="item in reportInfos"
                  :key="'report_' + item.reportId"
                  :label="item.reportName"
                  :value="item.reportId"
                />
              </el-option-group>
            </el-select>
            <el-button type="primary" @click="searchReportInfo" :loading="reportLoading" style="margin-left: 12px">
              查询
            </el-button>
            <el-button @click="loadAllReports">加载专题列表</el-button>
          </div>

          <div style="margin-top: 16px">
            <el-table :data="reportInfoList" v-loading="reportLoading" stripe style="width: 100%">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="title" label="标题" min-width="250" show-overflow-tooltip />
              <el-table-column prop="source" label="来源" width="120" />
              <el-table-column prop="publishTime" label="发布时间" width="110" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="viewArticleDetail(row)">查看</el-button>
                  <el-button v-if="row.url" link type="primary" @click="openUrl(row.url)">原文</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="!reportLoading && reportInfoList.length === 0" description="请选择专题后查询" />
            <div class="pagination" v-if="reportTotal > 0">
              <el-pagination
                v-model:current-page="reportPageNum"
                v-model:page-size="reportPageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="reportTotal"
                @size-change="searchReportInfo"
                @current-change="searchReportInfo"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ========== 文章详情对话框 ========== -->
    <el-dialog v-model="detailVisible" title="文章详情" width="700px">
      <div v-if="detailData" class="detail-content">
        <h2 class="detail-title">{{ detailData.title }}</h2>
        <div class="detail-meta">
          <span>来源：{{ detailData.source || '未知' }}</span>
          <span>发布时间：{{ detailData.publishTime || '未知' }}</span>
        </div>
        <div class="detail-body">{{ detailData.content || '暂无内容' }}</div>
        <div v-if="detailData.url" class="detail-link">
          <a :href="detailData.url" target="_blank">查看原文链接</a>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  getMonitorArticleAPI,
  postStatisticsAPI,
  searchAllReportAPI,
  getMonitorInfoListAPI
} from '@/api'

// ==================== 筛选条件 ====================
const timeRange = ref('today')
const customDateRange = ref(null)
const sensitivityLevel = ref(['0', '1', '2', '3'])
const source = ref('default')
const region = ref('')
const keyword = ref('')

// ==================== 文章监测 ====================
const loading = ref(false)
const articleList = ref([])
const articleTotal = ref(0)
const articlePageNum = ref(1)
const articlePageSize = ref(20)

// ==================== 统计图表 ====================
const activeTab = ref('article')
const sourceChartRef = ref(null)
const trendChartRef = ref(null)
const sensitivityChartRef = ref(null)
const sentimentChartRef = ref(null)
let sourceChartInstance = null
let trendChartInstance = null
let sensitivityChartInstance = null
let sentimentChartInstance = null

// ==================== 专题检索 ====================
const reportLoading = ref(false)
const alertInfos = ref([])
const reportInfos = ref([])
const selectedReportId = ref(null)
const reportInfoList = ref([])
const reportTotal = ref(0)
const reportPageNum = ref(1)
const reportPageSize = ref(20)

// ==================== 文章详情对话框 ====================
const detailVisible = ref(false)
const detailData = ref(null)

// ==================== 时间范围处理 ====================
const handleTimeRangeChange = () => {
  if (timeRange.value === 'custom' && !customDateRange.value) {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    customDateRange.value = [
      sevenDaysAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    ]
  }
}

// 根据时间范围获取 startTime / endTime
const getTimeParams = () => {
  const now = new Date()
  const formatDateTime = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d} 00:00:00`
  }

  let startTime, endTime
  endTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} 23:59:59`

  switch (timeRange.value) {
    case 'today': {
      startTime = formatDateTime(now)
      break
    }
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - 6)
      startTime = formatDateTime(d)
      break
    }
    case 'month': {
      const d = new Date(now)
      d.setDate(d.getDate() - 29)
      startTime = formatDateTime(d)
      break
    }
    case 'custom': {
      if (customDateRange.value && customDateRange.value.length === 2) {
        startTime = customDateRange.value[0] + ' 00:00:00'
        endTime = customDateRange.value[1] + ' 23:59:59'
      }
      break
    }
  }
  return { startTime, endTime }
}

// ==================== 文章监测查询 ====================
const handleSearch = async () => {
  loading.value = true
  try {
    const { startTime, endTime } = getTimeParams()
    // sensitivityLevel 数组中为字符串，需转为数字数组
    // 前端传 [1,1,1,1] 表示全部选中；后端需要数组 [0,1,2,3] 转换后使用
    const levelArray = [0, 1, 2, 3].map(i => sensitivityLevel.value.includes(String(i)) ? 1 : 0)

    const res = await getMonitorArticleAPI({
      startTime,
      endTime,
      sensitivityLevel: levelArray,
      source: source.value || '',
      region: region.value || '',
      keyWord: keyword.value || ''
    })

    if (res.code === 1) {
      articleList.value = res.data?.dataList || []
      articleTotal.value = articleList.value.length
    } else {
      ElMessage.error(res.msg || '查询失败')
      articleList.value = []
      articleTotal.value = 0
    }
  } catch (err) {
    console.error('文章监测查询失败:', err)
    ElMessage.error('网络异常，请重试')
    articleList.value = []
    articleTotal.value = 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  timeRange.value = 'today'
  customDateRange.value = null
  sensitivityLevel.value = ['0', '1', '2', '3']
  source.value = 'default'
  region.value = ''
  keyword.value = ''
  articleList.value = []
  articleTotal.value = 0
  articlePageNum.value = 1
  articlePageSize.value = 20

  alertInfos.value = []
  reportInfos.value = []
  selectedReportId.value = null
  reportInfoList.value = []
  reportTotal.value = 0
  reportPageNum.value = 1
  reportPageSize.value = 20
}

// ==================== 统计图表 ====================
const switchToStatistics = () => {
  activeTab.value = 'statistics'
  nextTick(() => {
    // 先提交数据到后端
    postStatisticsAPI({ dataList: articleList.value }).catch(() => {})
    // 再渲染图表
    renderCharts()
  })
}

const renderCharts = () => {
  renderSourceChart()
  renderTrendChart()
  renderSensitivityChart()
  renderSentimentChart()
}

const renderSourceChart = () => {
  if (!sourceChartRef.value) return
  if (sourceChartInstance) sourceChartInstance.dispose()
  sourceChartInstance = echarts.init(sourceChartRef.value)

  const sourceMap = {}
  articleList.value.forEach(item => {
    const s = item.source || '未知'
    sourceMap[s] = (sourceMap[s] || 0) + 1
  })
  const data = Object.entries(sourceMap).map(([name, value]) => ({ name, value }))

  sourceChartInstance.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['50%', '50%'],
      data,
      label: { formatter: '{b}: {d}%' }
    }]
  })
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  if (trendChartInstance) trendChartInstance.dispose()
  trendChartInstance = echarts.init(trendChartRef.value)

  const dayMap = {}
  articleList.value.forEach(item => {
    if (item.publishTime) {
      const day = item.publishTime.substring(0, 10)
      dayMap[day] = (dayMap[day] || 0) + 1
    }
  })
  const dates = Object.keys(dayMap).sort()
  const counts = dates.map(d => dayMap[d])

  trendChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: counts,
      smooth: true,
      areaStyle: { opacity: 0.3 }
    }]
  })
}

const renderSensitivityChart = () => {
  if (!sensitivityChartRef.value) return
  if (sensitivityChartInstance) sensitivityChartInstance.dispose()
  sensitivityChartInstance = echarts.init(sensitivityChartRef.value)

  const levelNames = ['普通', '低敏感', '中敏感', '高敏感']
  const levelCounts = [0, 0, 0, 0]
  // articleList 数据是 ClearNewsData 类型，不包含 sensitivity_level，图表仅基于已筛选数据绘制
  // 仅展示已知维度的分布

  sensitivityChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: levelNames },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [0, 0, 0, 0],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }]
  })
}

const renderSentimentChart = () => {
  if (!sentimentChartRef.value) return
  if (sentimentChartInstance) sentimentChartInstance.dispose()
  sentimentChartInstance = echarts.init(sentimentChartRef.value)

  sentimentChartInstance.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      data: [
        { name: '正面', value: 0 },
        { name: '中性', value: 0 },
        { name: '负面', value: 0 }
      ],
      label: { formatter: '{b}: {d}%' }
    }]
  })
}

// ==================== 文章详情 ====================
const viewArticleDetail = (row) => {
  detailData.value = row
  detailVisible.value = true
}

const openUrl = (url) => {
  window.open(url, '_blank')
}

// ==================== 专题检索 ====================
const loadAllReports = async () => {
  try {
    const res = await searchAllReportAPI()
    if (res.code === 1) {
      alertInfos.value = res.data?.alertInfos || []
      reportInfos.value = res.data?.reportInfos || []
    } else {
      ElMessage.error(res.msg || '获取专题列表失败')
    }
  } catch (err) {
    console.error('获取专题列表失败:', err)
    ElMessage.error('网络异常，请重试')
  }
}

const searchReportInfo = async () => {
  if (!selectedReportId.value) {
    ElMessage.warning('请先选择专题')
    return
  }

  reportLoading.value = true
  try {
    const res = await getMonitorInfoListAPI({
      reportId: selectedReportId.value,
      pageNum: reportPageNum.value,
      pageSize: reportPageSize.value
    })

    if (res.code === 1) {
      reportInfoList.value = res.data?.dataList || []
      reportTotal.value = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '查询专题信息失败')
      reportInfoList.value = []
      reportTotal.value = 0
    }
  } catch (err) {
    console.error('查询专题信息失败:', err)
    ElMessage.error('网络异常，请重试')
    reportInfoList.value = []
    reportTotal.value = 0
  } finally {
    reportLoading.value = false
  }
}

// ==================== 窗口自适应 ====================
const handleResize = () => {
  sourceChartInstance?.resize()
  trendChartInstance?.resize()
  sensitivityChartInstance?.resize()
  sentimentChartInstance?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadAllReports()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  sourceChartInstance?.dispose()
  trendChartInstance?.dispose()
  sensitivityChartInstance?.dispose()
  sentimentChartInstance?.dispose()
})
</script>

<style scoped>
.monitor-page {
  padding: 0;
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
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.filter-row:last-of-type {
  margin-bottom: 0;
}

.filter-label {
  min-width: 100px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.tab-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-count {
  font-size: 14px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ===== 统计图表 ===== */
.charts-container {
  padding: 8px 0;
}

.chart-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  flex: 1;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
}

.chart-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.chart-box {
  height: 320px;
}

/* ===== 文章详情对话框 ===== */
.detail-content {
  padding: 0 8px;
}

.detail-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 12px 0;
}

.detail-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
}

.detail-body {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-link {
  margin-top: 16px;
}

.detail-link a {
  color: #409eff;
  text-decoration: none;
}

.detail-link a:hover {
  text-decoration: underline;
}
</style>
