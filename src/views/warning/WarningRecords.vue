<template>
  <div class="warning-records">
    <!-- 上半部分：查询条件 -->
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">选择预警专题</span>
        </div>
      </template>
      <div class="form-container">
        <el-form :inline="true" class="search-form">
          <el-form-item label="预警专题:">
            <el-select v-model="filterTopic" placeholder="请选择预警专题" style="width: 300px;">
              <el-option
                v-for="item in topicOptions"
                :key="item.alertId"
                :label="item.alertName"
                :value="item.alertId"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 下半部分：标签页展示 -->
    <el-card class="result-card" shadow="never">
      <el-tabs v-model="activeTab" class="result-tabs">
        <!-- 标签页1：信息列表 -->
        <el-tab-pane label="信息列表" name="list">
          <div class="result-header">
            共 {{ hasSearched ? total : 0 }} 条结果
          </div>

          <!-- 空状态 -->
          <div v-if="!hasSearched" class="empty-state">
            <el-empty description="暂无数据，请选择预警专题进行查询" />
          </div>

          <!-- 预警记录列表 (查询后显示) -->
          <div v-else>
            <div class="records-list">
              <div class="record-item" v-for="(item, index) in recordsList" :key="item.newsId || index">
                <div class="item-checkbox">
                  <el-checkbox v-model="item.selected" @change="handleSelectionChange"></el-checkbox>
                </div>
                <div class="item-main">
                  <!-- 标题与标签 -->
                  <div class="item-title-row">
                    <span class="item-title" v-html="highlightKeyword(item.title)"></span>
                    <div class="item-tags">
                      <el-tag size="small" type="primary" class="tag-item" v-if="item.originalUrl" effect="plain">原文</el-tag>
                      <el-tag size="small" type="info" class="tag-item" v-if="item.articleType" effect="plain">{{ item.articleType }}</el-tag>
                      <el-tag size="small" :type="getSensitivityType(item.sensitivityLevel)" class="tag-item" v-if="item.sensitivityLabel" effect="plain">
                        {{ item.sensitivityLabel }}
                      </el-tag>
                      <el-tag size="small" :type="getSentimentType(item.sentimentType)" class="tag-item" v-if="item.sentimentType !== undefined" effect="plain">
                        {{ getSentimentLabel(item.sentimentType) }}
                      </el-tag>
                      <el-tag size="small" type="primary" class="tag-item" v-if="item.region" effect="plain">{{ item.region }}</el-tag>
                    </div>
                  </div>

                  <!-- 摘要内容 -->
                  <div class="item-content" v-html="highlightKeyword(item.content || '暂无内容摘要')">
                  </div>

                  <!-- 底部信息与操作 -->
                  <div class="item-footer">
                    <div class="footer-meta">
                      <span v-if="item.source">来源：{{ item.source }}</span>
                      <span v-if="item.platform">平台：{{ item.platform }}</span>
                      <span v-if="item.publisher">发文账号：{{ item.publisher }}</span>
                      <span v-if="item.region">地域：{{ item.region }}</span>
                      <span v-if="item.publishTime">发文时间：{{ formatTime(item.publishTime) }}</span>
                      <span v-if="item.comment !== undefined">评论：{{ item.comment }}</span>
                    </div>
                    <div class="footer-center" v-if="item.similarCount !== undefined">
                      <el-button size="small" round>相似文章：{{ item.similarCount || 3 }}</el-button>
                    </div>
                    <div class="footer-actions">
                      <el-button link type="primary" @click="viewOriginal(item.originalUrl)">查看原文</el-button>
                      <el-button link type="primary" @click="copyLink(item.originalUrl)">复制链接</el-button>
                      <el-button link type="primary" @click="handleProcess(item)">转为办件</el-button>
                      <el-button link type="primary">溯源</el-button>
                      <el-button link type="primary" @click="handleDelete(item)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 标签页2：统计分析 -->
        <el-tab-pane label="统计分析" name="statistics">
          <div v-if="!hasSearched" class="empty-state">
            <el-empty description="暂无数据，请选择预警专题进行查询" />
          </div>
          <div v-else class="statistics-container">
            <!-- 统计卡片 -->
            <div class="stats-cards">
              <div class="stat-card card-blue">
                <div class="stat-label">文章总数</div>
                <div class="stat-value">{{ statisticsData.totalArticles }}</div>
              </div>
              <div class="stat-card card-purple">
                <div class="stat-label">敏感总数</div>
                <div class="stat-value">{{ statisticsData.sensitiveCount }}</div>
              </div>
              <div class="stat-card card-orange">
                <div class="stat-label">中性总数</div>
                <div class="stat-value">{{ statisticsData.neutralCount }}</div>
              </div>
              <div class="stat-card card-green">
                <div class="stat-label">非敏感总数</div>
                <div class="stat-value">{{ statisticsData.normalCount }}</div>
              </div>
            </div>

            <!-- 地域分布 -->
            <div class="region-analysis">
              <div class="region-map">
                <div class="section-title">地域分布热图</div>
                <div id="chinaMap" class="map-container"></div>
              </div>
              <div class="region-table">
                <div class="section-title">地域发布量排名</div>
                <el-table :data="regionRankData" style="width: 100%" max-height="500">
                  <el-table-column prop="rank" label="排名" width="80" align="center" />
                  <el-table-column prop="region" label="地域" width="120" />
                  <el-table-column prop="count" label="发文量" width="100" align="center" />
                  <el-table-column prop="sensitiveCount" label="敏感信息" align="center" />
                </el-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 处理对话框 -->
    <el-dialog v-model="showProcessDialog" title="处理预警" width="500px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-select v-model="processForm.result" placeholder="请选择处理结果">
            <el-option label="已处理" value="已处理" />
            <el-option label="误报" value="误报" />
            <el-option label="待跟进" value="待跟进" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="processForm.remark" type="textarea" :rows="4" placeholder="请输入处理说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProcessDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchAllAlertAPI, getAlertInfoListAPI } from '@/api/index'
import * as echarts from 'echarts'

const filterTopic = ref('')
const topicOptions = ref([])
const activeTab = ref('list')

// 统计数据
const statisticsData = ref({
  totalArticles: 0,
  sensitiveCount: 0,
  neutralCount: 0,
  normalCount: 0
})

// 地域排名数据
const regionRankData = ref([])

// 地图实例
let mapChart = null

const fetchTopics = async () => {
  try {
    const res = await searchAllAlertAPI()
    if (res.code === 1 && res.data && res.data.alertInfos) {
      topicOptions.value = res.data.alertInfos
    } else {
      ElMessage.error(res.msg || '获取预警专题数据失败')
    }
  } catch (error) {
    console.error('获取预警专题数据异常:', error)
    ElMessage.error('获取预警专题数据失败')
  }
}

onMounted(() => {
  fetchTopics()
})

const hasSearched = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])

const showProcessDialog = ref(false)
const processForm = ref({
  result: '',
  remark: ''
})

const recordsList = ref([])

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleFilter = async () => {
  if (!filterTopic.value) {
    ElMessage.warning('请选择预警专题')
    return
  }

  try {
    const res = await getAlertInfoListAPI({
      alertId: filterTopic.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (res.code === 1 && res.data) {
      // 修改为 NewsDataList 以匹配 API 返回格式
      recordsList.value = res.data.NewsDataList || []
      total.value = res.data.total || res.data.NewsDataList?.length || 0
      hasSearched.value = true

      // 计算统计数据
      calculateStatistics()

      ElMessage.success('查询成功')
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询舆情信息异常:', error)
    ElMessage.error('查询舆情信息失败')
  }
}

// 计算统计数据
const calculateStatistics = () => {
  const data = recordsList.value
  statisticsData.value.totalArticles = data.length

  // 统计敏感度
  statisticsData.value.sensitiveCount = data.filter(item =>
    item.sensitivityLevel && item.sensitivityLevel > 0
  ).length

  statisticsData.value.neutralCount = data.filter(item =>
    item.sentimentType === 0
  ).length

  statisticsData.value.normalCount = data.filter(item =>
    !item.sensitivityLevel || item.sensitivityLevel === 0
  ).length

  // 统计地域分布
  const regionMap = {}
  data.forEach(item => {
    if (item.region) {
      if (!regionMap[item.region]) {
        regionMap[item.region] = {
          count: 0,
          sensitiveCount: 0
        }
      }
      regionMap[item.region].count++
      if (item.sensitivityLevel && item.sensitivityLevel > 0) {
        regionMap[item.region].sensitiveCount++
      }
    }
  })

  // 转换为排名数据
  regionRankData.value = Object.entries(regionMap)
    .map(([region, data]) => ({
      region,
      count: data.count,
      sensitiveCount: data.sensitiveCount
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item, index) => ({
      rank: index + 1,
      ...item
    }))

  // 初始化地图
  nextTick(() => {
    if (activeTab.value === 'statistics') {
      initMap()
    }
  })
}

// 初始化地图
const initMap = () => {
  const mapDom = document.getElementById('chinaMap')
  if (!mapDom) return

  if (mapChart) {
    mapChart.dispose()
  }

  mapChart = echarts.init(mapDom)

  // 简化版：使用柱状图代替地图（因为需要额外的地图 JSON 数据）
  const option = {
    title: {
      text: '地域分布',
      left: 'center',
      top: 20
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: regionRankData.value.map(item => item.region),
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '发文量'
    },
    series: [
      {
        name: '发文量',
        type: 'bar',
        data: regionRankData.value.map(item => item.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  }

  mapChart.setOption(option)
}

// 监听标签页切换
watch(activeTab, (newVal) => {
  if (newVal === 'statistics' && hasSearched.value) {
    nextTick(() => {
      initMap()
    })
  }
})

const handleSizeChange = (val) => {
  pageSize.value = val
  if (hasSearched.value) {
    handleFilter()
  }
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  if (hasSearched.value) {
    handleFilter()
  }
}

const handleReset = () => {
  filterTopic.value = ''
  hasSearched.value = false
  currentPage.value = 1
  pageSize.value = 10
  recordsList.value = []
  total.value = 0
}

const handleProcess = () => {
  processForm.value = {
    result: '',
    remark: ''
  }
  showProcessDialog.value = true
}

const handleSubmitProcess = () => {
  if (!processForm.value.result) {
    ElMessage.warning('请选择处理结果')
    return
  }
  ElMessage.success('处理成功')
  showProcessDialog.value = false
}

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除这条预警记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 辅助方法
const getSensitivityType = (level) => {
  switch (level) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'danger'
    case 3: return 'danger'
    default: return 'info'
  }
}

const getSentimentType = (type) => {
  switch (type) {
    case 1: return 'success' // 正面
    case 0: return 'info'    // 中性
    case -1: return 'danger' // 负面
    default: return 'info'
  }
}

const getSentimentLabel = (type) => {
  switch (type) {
    case 1: return '正面'
    case 0: return '中性'
    case -1: return '负面'
    default: return '未知'
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

const viewOriginal = (url) => {
  if (url) {
    window.open(url, '_blank')
  } else {
    ElMessage.warning('暂无原文链接')
  }
}

const copyLink = async (url) => {
  if (!url) {
    ElMessage.warning('暂无链接可复制')
    return
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      ElMessage.success('复制成功')
    } else {
      const input = document.createElement('input')
      input.setAttribute('value', url)
      document.body.appendChild(input)
      input.select()
      // eslint-disable-next-line
      document.execCommand('copy')
      document.body.removeChild(input)
      ElMessage.success('复制成功')
    }
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}

// 关键词高亮
const highlightKeyword = (text) => {
  if (!text) return ''
  // 这里可以根据实际需求添加关键词高亮逻辑
  // 暂时直接返回原文本
  return text
}

</script>

<style scoped>
.warning-records {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
}

.form-container {
  padding: 10px 0 0 0;
}

.result-card {
  min-height: 400px;
}

.result-header {
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.empty-state {
  padding: 60px 0;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.record-item {
  display: flex;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  transition: box-shadow 0.3s;
}

.record-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.item-checkbox {
  margin-right: 15px;
  padding-top: 2px;
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
  margin-top: 5px;
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

.footer-center {
  margin: 0 10px;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

/* 统计分析样式 */
.statistics-container {
  padding: 20px 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  position: relative;
  padding: 24px 20px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: left;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 顶部蓝色装饰条 */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #409eff;
}

/* 左上角弧形内凹裁切效果 */
.stat-card::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  width: 30px;
  height: 30px;
  background: #f0f2f5;
  border-radius: 50%;
}

.stat-card .stat-label {
  position: relative;
  z-index: 1;
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 400;
}

.stat-card .stat-value {
  position: relative;
  z-index: 1;
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
}

/* 不同卡片的数字颜色 */
.stat-card.card-blue .stat-value {
  color: #409eff;
}

.stat-card.card-purple .stat-value {
  color: #9c27b0;
}

.stat-card.card-orange .stat-value {
  color: #ff9800;
}

.stat-card.card-green {
  color: #4caf50;
}

.stat-card.card-green .stat-value {
  color: #4caf50;
}

.region-analysis {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

.region-map,
.region-table {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

.map-container {
  width: 100%;
  height: 500px;
}
</style>


