<template>
  <div class="warning-map-container">
    <!-- 左侧统计面板 -->
    <div class="stats-panel">
      <div class="stat-item" @click="filterType('person')">
        <div class="stat-icon person-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">预警人员今日预警</div>
          <div class="stat-value">{{ stats.person }}</div>
        </div>
      </div>

      <div class="stat-item" @click="filterType('event')">
        <div class="stat-icon event-icon">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">预警事件今日预警</div>
          <div class="stat-value">{{ stats.event }}</div>
        </div>
      </div>

      <div class="stat-item" @click="filterType('location')">
        <div class="stat-icon location-icon">
          <el-icon><Location /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">预警地点今日预警</div>
          <div class="stat-value">{{ stats.location }}</div>
        </div>
      </div>

      <div class="stat-item" @click="filterType('vehicle')">
        <div class="stat-icon vehicle-icon">
          <el-icon><Van /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">预警车辆今日预警</div>
          <div class="stat-value">{{ stats.vehicle }}</div>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div id="map-container" class="map-container"></div>

    <!-- 右上角控制按钮 -->
    <div class="map-controls">
      <el-button :type="activeFilter === 'person' ? 'primary' : ''" @click="toggleFilter('person')">
        预警人员
      </el-button>
      <el-button :type="activeFilter === 'event' ? 'primary' : ''" @click="toggleFilter('event')">
        预警事件
      </el-button>
      <el-button :type="activeFilter === 'location' ? 'primary' : ''" @click="toggleFilter('location')">
        预警地点
      </el-button>
    </div>

    <!-- 底部图例 -->
    <div class="map-legend">
      <div class="legend-item">
        <span class="legend-icon level-1">▲</span>
        <span>一级预警人员</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon level-2">▲</span>
        <span>二级预警人员</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon level-3">▲</span>
        <span>三级预警人员</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon attention">👤</span>
        <span>关注预警人员</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon event">🏢</span>
        <span>预警事件</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon location">📍</span>
        <span>预警地点</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon vehicle">🚗</span>
        <span>预警车辆</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { User, OfficeBuilding, Location, Van } from '@element-plus/icons-vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const map = ref(null)
const activeFilter = ref('')
const markers = ref([])

const stats = ref({
  person: 0,
  event: 3,
  location: 12,
  vehicle: 0
})

// 模拟预警数据
const warningData = ref([
  { type: 'event', level: 1, position: [118.1, 24.48], name: '预警事件1' },
  { type: 'event', level: 1, position: [118.15, 24.5], name: '预警事件2' },
  { type: 'event', level: 2, position: [118.2, 24.45], name: '预警事件3' },
  { type: 'location', level: 1, position: [118.08, 24.46], name: '预警地点1' },
  { type: 'location', level: 2, position: [118.12, 24.52], name: '预警地点2' },
])

const initMap = async () => {
  try {
    const AMap = await AMapLoader.load({
      key: 'fc96bd15397f9a31bbdad2cd15c041c1', // 需要在高德开放平台申请
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.Polygon', 'AMap.InfoWindow']
    })

    map.value = new AMap.Map('map-container', {
      zoom: 11,
      center: [118.1, 24.48], // 厦门市中心
      viewMode: '3D',
      pitch: 0
    })

    // 绘制区域边界（蓝色虚线）
    drawBoundary(AMap)

    // 添加标记点
    addMarkers(AMap)
  } catch (e) {
    console.error('地图加载失败', e)
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
  warningData.value.forEach(item => {
    const icon = getMarkerIcon(item.type, item.level)

    const marker = new AMap.Marker({
      position: item.position,
      icon: icon,
      title: item.name,
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
  const infoWindow = new AMap.InfoWindow({
    content: `
      <div style="padding: 10px;">
        <h4>${data.name}</h4>
        <p>类型: ${data.type}</p>
        <p>级别: ${data.level}级</p>
      </div>
    `,
    offset: new AMap.Pixel(0, -30)
  })
  infoWindow.open(map.value, marker.getPosition())
}

const filterType = (type) => {
  activeFilter.value = type
  // 实现筛选逻辑
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
    if (activeFilter.value === '' || data.type === activeFilter.value) {
      marker.show()
    } else {
      marker.hide()
    }
  })
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
  height: 100vh;
  background: #0a1929;
}

.stats-panel {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 280px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
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
  font-size: 14px;
  color: #666666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333333;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
}

.map-legend {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(10, 25, 41, 0.9);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 8px;
  padding: 15px 30px;
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 14px;
}

.legend-icon {
  font-size: 16px;
}

.legend-icon.level-1 {
  color: #FF4444;
}

.legend-icon.level-2 {
  color: #FF8800;
}

.legend-icon.level-3 {
  color: #FFCC00;
}
</style>
