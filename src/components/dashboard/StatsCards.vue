<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="card-header">
        <span class="card-title">信息总量</span>
        <el-icon class="info-icon"><QuestionFilled /></el-icon>
      </div>
      <div class="card-value">{{ formatNumber(summary.totalNews) }}</div>
      <div class="card-chart">
        <div ref="totalNewsChart" class="mini-chart"></div>
      </div>
      <div class="card-footer">
        <span>文章 {{ formatNumber(summary.totalNewsArticle) }}</span>
        <span>视频 {{ formatNumber(summary.totalNewsVideo) }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="card-header">
        <span class="card-title">预警信息总量</span>
        <el-icon class="info-icon"><QuestionFilled /></el-icon>
      </div>
      <div class="card-value">{{ formatNumber(summary.totalAlert) }}</div>
      <div class="card-chart">
        <div ref="totalAlertChart" class="mini-chart bar"></div>
      </div>
      <div class="card-footer">
        <span>文章 {{ formatNumber(summary.totalAlertArticle) }}</span>
        <span>视频 {{ formatNumber(summary.totalAlertVideo) }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="card-header">
        <span class="card-title">办件总量</span>
        <el-icon class="info-icon"><QuestionFilled /></el-icon>
      </div>
      <div class="card-value">{{ formatNumber(summary.totalCase) }}</div>
      <div class="card-footer">
        <div class="footer-row">环比 <el-icon class="trend-icon"><CaretTop /></el-icon> {{ summary.caseConversionRate }}%</div>
        <div class="footer-row">办结中 {{ formatNumber(summary.caseInProgress) }} | 已办结 {{ formatNumber(summary.caseFinished) }}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="card-header">
        <span class="card-title">今日信息量</span>
        <el-icon class="info-icon"><QuestionFilled /></el-icon>
      </div>
      <div class="card-value">{{ formatNumber(summary.todayNews) }}</div>
      <div class="card-footer">
        <div class="footer-row">同比 <el-icon class="trend-icon"><CaretTop /></el-icon> {{ summary.todayNewsYoy }}%</div>
        <div class="footer-row">文章 {{ formatNumber(summary.todayNewsArticle) }} | 视频 {{ formatNumber(summary.todayNewsVideo) }}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="card-header">
        <span class="card-title">今日预警信息量</span>
        <el-icon class="info-icon"><QuestionFilled /></el-icon>
      </div>
      <div class="card-value">{{ formatNumber(summary.todayAlert) }}</div>
      <div class="card-footer">
        <div class="footer-row">同比 <el-icon class="trend-icon"><CaretTop /></el-icon> {{ summary.todayAlertYoy }}%</div>
        <div class="footer-row">一级 {{ formatNumber(summary.todayAlertLevel1) }} | 二级 {{ formatNumber(summary.todayAlertLevel2) }} | 三级 {{ formatNumber(summary.todayAlertLevel3) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { QuestionFilled, CaretTop } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({
      totalNews: 0, totalNewsArticle: 0, totalNewsVideo: 0,
      totalAlert: 0, totalAlertArticle: 0, totalAlertVideo: 0,
      totalCase: 0, caseInProgress: 0, caseFinished: 0, caseConversionRate: 0,
      todayNews: 0, todayNewsArticle: 0, todayNewsVideo: 0, todayNewsYoy: 0,
      todayAlert: 0, todayAlertYoy: 0,
      todayAlertLevel1: 0, todayAlertLevel2: 0, todayAlertLevel3: 0
    })
  },
  trendData: {
    type: Object,
    default: () => ({ dates: [], newsCounts: [], alertCounts: [] })
  }
})

const totalNewsChart = ref(null)
const totalAlertChart = ref(null)
let newsChartInstance = null
let alertChartInstance = null

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return num.toLocaleString()
}

const renderMiniChart = (dom, data, color) => {
  if (!dom || !data.length) return
  const chart = echarts.init(dom)
  chart.setOption({
    grid: { left: 0, right: 0, top: 2, bottom: 0 },
    xAxis: { show: false, type: 'category', data: props.trendData.dates },
    yAxis: { show: false },
    series: [{
      data,
      type: 'line',
      smooth: true,
      lineStyle: { color, width: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color },
            { offset: 1, color: 'rgba(255,255,255,0.01)' }
          ]
        }
      },
      showSymbol: false
    }]
  })
  return chart
}

watch(() => props.trendData, async () => {
  if (!props.trendData.dates?.length) return
  await nextTick()
  if (newsChartInstance) { newsChartInstance.dispose(); newsChartInstance = null }
  if (alertChartInstance) { alertChartInstance.dispose(); alertChartInstance = null }
  newsChartInstance = renderMiniChart(totalNewsChart.value, props.trendData.newsCounts, '#42a5f5')
  alertChartInstance = renderMiniChart(totalAlertChart.value, props.trendData.alertCounts, '#ff9800')
}, { deep: true, immediate: true })

onBeforeUnmount(() => {
  if (newsChartInstance) newsChartInstance.dispose()
  if (alertChartInstance) alertChartInstance.dispose()
})
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.card-title {
  font-size: 14px;
  color: #666;
}
.info-icon {
  color: #999;
  font-size: 14px;
  cursor: pointer;
}
.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}
.card-chart {
  height: 40px;
  margin-bottom: 15px;
}
.mini-chart {
  width: 100%;
  height: 100%;
}
.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #999;
}
.trend-icon {
  color: #67c23a;
  font-size: 12px;
}
@media (max-width: 1600px) {
  .stats-cards { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1200px) {
  .stats-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
