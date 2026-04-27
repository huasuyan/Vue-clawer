<template>
  <div class="warning-map-container">
    <!-- 左侧统计面板 -->
    <transition name="slide-left">
      <div v-show="showStatsPanel" class="stats-panel">
        <div class="stat-item" @click="filterType(1)">
          <div class="stat-icon person-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">一级预警</div>
            <div class="stat-value">{{ stats.person }}</div>
          </div>
        </div>

        <div class="stat-item" @click="filterType(2)">
          <div class="stat-icon event-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">二级预警</div>
            <div class="stat-value">{{ stats.event }}</div>
          </div>
        </div>

        <div class="stat-item" @click="filterType(3)">
          <div class="stat-icon location-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">三级预警</div>
            <div class="stat-value">{{ stats.location }}</div>
          </div>
        </div>

        <div class="stat-item" @click="filterType('all')">
          <div class="stat-icon vehicle-icon">
            <el-icon><Van /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">预警总数</div>
            <div class="stat-value">{{ stats.vehicle }}</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 左侧收起/展开按钮 -->
    <div class="toggle-btn left-toggle" :class="{ collapsed: !showStatsPanel }" @click="showStatsPanel = !showStatsPanel">
      <el-icon><DArrowLeft v-if="showStatsPanel" /><DArrowRight v-else /></el-icon>
    </div>

    <!-- 地图容器 -->
    <div id="map-container" class="map-container"></div>

    <!-- 右侧预警事件列表 -->
    <transition name="slide-right">
      <div v-show="showEventsPanel" class="events-panel">
      <div class="events-header">
        <h3>预警事件列表</h3>
        <span class="events-count">共 {{ filteredWarningData.length }} 条</span>
      </div>
      <div class="time-filter">
        <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
          <el-radio-button label="today">今日</el-radio-button>
          <el-radio-button label="7day">近7日</el-radio-button>
          <el-radio-button label="30day">近30日</el-radio-button>
          <el-radio-button label="all">全部</el-radio-button>
        </el-radio-group>
      </div>
      <div class="topic-filter">
        <el-select
          v-model="selectedTopic"
          placeholder="选择预警专题"
          size="small"
          clearable
          @change="handleTopicChange"
          style="width: 100%"
        >
          <el-option label="全部专题" value="" />
          <el-option
            v-for="topic in topicList"
            :key="topic"
            :label="topic"
            :value="topic"
          />
        </el-select>
      </div>
      <div class="events-list">
        <div
          v-for="item in filteredWarningData"
          :key="item.id"
          class="event-item"
          @click="focusOnEvent(item)"
        >
          <div class="event-level" :class="`level-${item.alertLevel}`">
            {{ ['', '一级', '二级', '三级'][item.alertLevel] }}
          </div>
          <div class="event-content">
            <div class="event-title">{{ item.alertName }}</div>
            <div class="event-news">{{ item.newsTitle }}</div>
            <div class="event-time">{{ formatTime(item.alertDate) }}</div>
          </div>
        </div>
      </div>
    </div>
    </transition>

    <!-- 右侧收起/展开按钮 -->
    <div class="toggle-btn right-toggle" :class="{ collapsed: !showEventsPanel }" @click="showEventsPanel = !showEventsPanel">
      <el-icon><DArrowRight v-if="showEventsPanel" /><DArrowLeft v-else /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { User, OfficeBuilding, Location, Van, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AMapLoader from '@amap/amap-jsapi-loader'
import request from '@/utils/request'

const map = ref(null)
const activeFilter = ref('')
const markers = ref([])
const timeRange = ref('today')
const showStatsPanel = ref(true)
const showEventsPanel = ref(true)
const selectedTopic = ref('') // 选中的预警专题
const topicList = ref([]) // 预警专题列表

const stats = ref({
  person: 0,
  event: 0,
  location: 0,
  vehicle: 0
})

// 预警数据
const warningData = ref([])

// 获取预警数据
const getTodayAlerts = async (dayType = 'today') => {
  try {
    let url = '/api/v1/alertMap/today'

    // 如果是全部数据，使用不同的接口
    if (dayType === 'all') {
      url = '/api/v1/alertMap/list'
    } else {
      url = `/api/v1/alertMap/today?dayType=${dayType}`
    }

    const res = await request({
      url: url,
      method: 'get'
    })

    if (res.code === 1) {
      warningData.value = res.data || []

      // 提取所有唯一的预警专题
      const topics = [...new Set(warningData.value.map(item => item.alertName).filter(Boolean))]
      topicList.value = topics

      // 根据预警级别统计数量
      const level1 = warningData.value.filter(item => item.alertLevel === 1).length
      const level2 = warningData.value.filter(item => item.alertLevel === 2).length
      const level3 = warningData.value.filter(item => item.alertLevel === 3).length

      stats.value = {
        person: level1,
        event: level2,
        location: level3,
        vehicle: warningData.value.length
      }

      // 如果地图已初始化，添加标记
      if (map.value) {
        clearMarkers()
        addMarkers(window.AMap)
      }
    } else {
      ElMessage.error(res.msg || '获取预警数据失败')
    }
  } catch (error) {
    console.error('获取预警数据失败:', error)
    ElMessage.error('获取预警数据失败')
  }
}

// 处理时间范围切换
const handleTimeRangeChange = (value) => {
  getTodayAlerts(value)
}

// 处理预警专题切换
const handleTopicChange = () => {
  // 筛选逻辑在 computed 中处理，这里只需要更新地图标记
  if (map.value) {
    clearMarkers()
    addMarkers(window.AMap)
  }
}

// 根据选中的专题过滤预警数据
const filteredWarningData = computed(() => {
  if (!selectedTopic.value) {
    return warningData.value
  }
  return warningData.value.filter(item => item.alertName === selectedTopic.value)
})

const initMap = async () => {
  try {
    const AMap = await AMapLoader.load({
      key: 'fc96bd15397f9a31bbdad2cd15c041c1', // 需要在高德开放平台申请
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.Polygon', 'AMap.InfoWindow']
    })

    map.value = new AMap.Map('map-container', {
      zoom: 11,
      center: [116.397428, 39.90923], // 北京市中心
      viewMode: '3D',
      pitch: 0
    })

    // 绘制区域边界（蓝色虚线）
    drawBoundary(AMap)

    // 保存 AMap 到 window 以便后续使用
    window.AMap = AMap

    // 加载今日预警数据
    await getTodayAlerts()
  } catch (e) {
    console.error('地图加载失败', e)
    ElMessage.error('地图加载失败')
  }
}

const drawBoundary = (AMap) => {
  const path = [
    [118.05, 24.55],
    [118.25, 24.55],
    [118.25, 24.40],
    [118.05, 24.40]
  ]

  const polygon = new AMap.Polygon({
    path: path,
    strokeColor: '#4A90E2',
    strokeWeight: 2,
    strokeStyle: 'dashed',
    fillColor: 'transparent',
    zIndex: 50
  })

  map.value.add(polygon)
}

const addMarkers = (AMap) => {
  const dataToShow = selectedTopic.value
    ? warningData.value.filter(item => item.alertName === selectedTopic.value)
    : warningData.value

  dataToShow.forEach(item => {
    // 使用返回的经纬度数据
    const position = [parseFloat(item.longitude), parseFloat(item.latitude)]

    // 根据预警级别显示不同颜色的标记
    const icon = getMarkerIcon('event', item.alertLevel)

    const marker = new AMap.Marker({
      position: position,
      icon: icon,
      title: item.alertName,
      extData: item
    })

    marker.on('click', () => {
      showInfoWindow(AMap, marker, item)
    })

    map.value.add(marker)
    markers.value.push(marker)
  })
}

const getMarkerIcon = (type, level) => {
  const colors = {
    1: '#FF4444',
    2: '#FF8800',
    3: '#FFCC00'
  }

  const color = colors[level] || '#FF4444'

  // 使用SVG创建自定义图标
  let svg = ''
  if (type === 'person') {
    svg = `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
      <polygon points="15,5 25,25 5,25" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>`
  } else if (type === 'event') {
    svg = `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="20" height="15" fill="${color}" stroke="white" stroke-width="2"/>
      <rect x="10" y="5" width="10" height="5" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>`
  } else if (type === 'location') {
    svg = `<svg width="30" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15,5 Q25,5 25,15 Q25,25 15,35 Q5,25 5,15 Q5,5 15,5" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="15" cy="15" r="5" fill="white"/>
    </svg>`
  } else if (type === 'vehicle') {
    svg = `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="20" height="10" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="8" cy="22" r="3" fill="white"/>
      <circle cx="22" cy="22" r="3" fill="white"/>
    </svg>`
  }

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

const showInfoWindow = (AMap, marker, data) => {
  const levelText = ['', '一级预警', '二级预警', '三级预警'][data.alertLevel] || '未知级别'
  const levelColor = ['', '#FF4444', '#FF8800', '#FFCC00'][data.alertLevel] || '#999'

  const infoWindow = new AMap.InfoWindow({
    content: `
      <div style="padding: 12px; min-width: 300px; max-width: 400px;">
        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px; border-bottom: 2px solid ${levelColor}; padding-bottom: 8px;">
          ${data.alertName}
        </h4>
        <div style="margin-bottom: 8px;">
          <span style="display: inline-block; padding: 2px 8px; background: ${levelColor}; color: white; border-radius: 3px; font-size: 12px;">
            ${levelText}
          </span>
        </div>
        <p style="margin: 8px 0; color: #666; font-size: 14px; line-height: 1.6;">
          <strong>新闻标题:</strong> ${data.newsTitle}
        </p>
        <p style="margin: 8px 0; color: #666; font-size: 13px; line-height: 1.5;">
          ${data.newsContent}
        </p>
        <p style="margin: 8px 0; color: #999; font-size: 12px;">
          <strong>预警时间:</strong> ${data.alertDate ? new Date(data.alertDate).toLocaleString('zh-CN') : '未知'}
        </p>
        <p style="margin: 8px 0; color: #999; font-size: 12px;">
          <strong>位置:</strong> ${data.longitude}, ${data.latitude}
        </p>
        ${data.newsUrl ? `
          <a href="${data.newsUrl}" target="_blank" style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: #409eff; color: white; text-decoration: none; border-radius: 3px; font-size: 12px;">
            查看原文
          </a>
        ` : ''}
      </div>
    `,
    offset: new AMap.Pixel(0, -30)
  })
  infoWindow.open(map.value, marker.getPosition())
}

const filterType = (type) => {
  activeFilter.value = type
  toggleFilter(type)
}

const clearMarkers = () => {
  markers.value.forEach(marker => {
    map.value.remove(marker)
  })
  markers.value = []
}

const toggleFilter = (type) => {
  if (activeFilter.value === type) {
    activeFilter.value = ''
  } else {
    activeFilter.value = type
  }

  // 根据筛选条件显示/隐藏标记
  markers.value.forEach(marker => {
    const data = marker.getExtData()
    if (activeFilter.value === '' || activeFilter.value === 'all') {
      marker.show()
    } else if (typeof activeFilter.value === 'number' && data.alertLevel === activeFilter.value) {
      marker.show()
    } else {
      marker.hide()
    }
  })
}

// 聚焦到指定预警事件
const focusOnEvent = (item) => {
  const position = [parseFloat(item.longitude), parseFloat(item.latitude)]

  // 计算右侧面板占用的宽度（面板宽度 + 边距）
  const rightPanelWidth = showEventsPanel.value ? 360 : 0
  const leftPanelWidth = showStatsPanel.value ? 280 : 0

  // 计算可视区域的实际中心偏移（像素）
  const offsetX = (leftPanelWidth - rightPanelWidth) / 2

  // 先设置合适的缩放级别（使用动画）
  map.value.setZoom(15, true, 300)

  // 延迟一点再移动中心点，让缩放动画先执行
  setTimeout(() => {
    // 移动到目标位置（使用平滑动画）
    map.value.setCenter(position, true, 500)

    // 等待地图移动完成后，再进行偏移调整
    setTimeout(() => {
      // 将地图向左或向右平移，使目标点位于可视区域中心

      // 等待偏移完成后再显示信息窗口
      setTimeout(() => {
        const marker = markers.value.find(m => m.getExtData().id === item.id)
        if (marker) {
          const levelText = ['', '一级预警', '二级预警', '三级预警'][item.alertLevel] || '未知级别'
          const levelColor = ['', '#FF4444', '#FF8800', '#FFCC00'][item.alertLevel] || '#999'

          const infoWindow = new window.AMap.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 300px; max-width: 400px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px; border-bottom: 2px solid ${levelColor}; padding-bottom: 8px;">
                  ${item.alertName}
                </h4>
                <div style="margin-bottom: 8px;">
                  <span style="display: inline-block; padding: 2px 8px; background: ${levelColor}; color: white; border-radius: 3px; font-size: 12px;">
                    ${levelText}
                  </span>
                </div>
                <p style="margin: 8px 0; color: #666; font-size: 14px; line-height: 1.6;">
                  <strong>新闻标题:</strong> ${item.newsTitle}
                </p>
                <p style="margin: 8px 0; color: #666; font-size: 13px; line-height: 1.5;">
                  ${item.newsContent}
                </p>
                <p style="margin: 8px 0; color: #999; font-size: 12px;">
                  <strong>预警时间:</strong> ${item.alertDate ? new Date(item.alertDate).toLocaleString('zh-CN') : '未知'}
                </p>
                <p style="margin: 8px 0; color: #999; font-size: 12px;">
                  <strong>位置:</strong> ${item.longitude}, ${item.latitude}
                </p>
                ${item.newsUrl ? `
                  <a href="${item.newsUrl}" target="_blank" style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: #409eff; color: white; text-decoration: none; border-radius: 3px; font-size: 12px;">
                    查看原文
                  </a>
                ` : ''}
              </div>
            `,
            offset: new window.AMap.Pixel(0, -30)
          })
          infoWindow.open(map.value, position)
        }
      }, 350)
    }, 550)
  }, 350)
}

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return '未知时间'
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  map.value?.destroy()
})
</script>

<style scoped>
.warning-map-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  background: #0a1929;
}

.stats-panel {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 240px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
}

.person-icon {
  background: #5b8ff9;
}

.event-icon {
  background: #f5222d;
}

.location-icon {
  background: #fa8c16;
}

.vehicle-icon {
  background: #eb2f96;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #666666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
}

.map-container {
  width: 100%;
  height: 100%;
}

.events-panel {
  position: absolute;
  right: 20px;
  top: 20px;
  bottom: 20px;
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.events-header {
  padding: 14px 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.events-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.events-count {
  font-size: 13px;
  color: #999;
}

.time-filter {
  padding: 10px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.time-filter :deep(.el-radio-group) {
  width: 100%;
}

.time-filter :deep(.el-radio-button) {
  flex: 1;
}

.time-filter :deep(.el-radio-button__inner) {
  width: 100%;
  padding: 6px 8px;
  font-size: 12px;
}

.topic-filter {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.events-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.event-item {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  gap: 10px;
}

.event-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateX(-2px);
}

.event-level {
  flex-shrink: 0;
  width: 45px;
  height: 45px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.event-level.level-1 {
  background: #FF4444;
}

.event-level.level-2 {
  background: #FF8800;
}

.event-level.level-3 {
  background: #FFCC00;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-news {
  font-size: 11px;
  color: #666;
  margin-bottom: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  font-size: 10px;
  color: #999;
}

/* 收起/展开按钮 */
.toggle-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.3s;
  font-size: 18px;
  color: #666;
}

.toggle-btn:hover {
  background: #fff;
  color: #409eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.left-toggle {
  left: 280px;
  border-radius: 0 8px 8px 0;
  border-left: none;
}

.left-toggle.collapsed {
  left: 20px;
}

.right-toggle {
  right: 360px;
  border-radius: 8px 0 0 8px;
  border-right: none;
}

.right-toggle.collapsed {
  right: 20px;
}

/* 过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
