<template>
  <div class="wordcloud-section">
    <div class="section-header">
      <h3>热词分析</h3>
      <div class="header-actions">
        <el-button
          v-for="item in statTypeOptions"
          :key="item.value"
          :type="activeStatType === item.value ? 'primary' : ''"
          size="small"
          @click="switchType(item.value)"
        >{{ item.label }}</el-button>
      </div>
    </div>
    <div class="wordcloud-content">
      <div ref="keywordCloudRef" class="wordcloud-area"></div>
    </div>
    <div class="section-header" style="margin-top: 20px;">
      <h3>活跃用户</h3>
    </div>
    <div class="wordcloud-content">
      <div ref="userCloudRef" class="wordcloud-area small"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  hotKeywords: {
    type: Array,
    default: () => []
  },
  hotUsers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['statTypeChange'])

const statTypeOptions = [
  { label: '今天', value: 'daily' },
  { label: '近一周', value: 'weekly' },
  { label: '近一月', value: 'monthly' }
]

const activeStatType = ref('daily')
const keywordCloudRef = ref(null)
const userCloudRef = ref(null)
let keywordChartInstance = null
let userChartInstance = null

const COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']

const switchType = (type) => {
  activeStatType.value = type
  emit('statTypeChange', type)
}



const isInside = (x, y, placed, padW, padH, w, h) => {
  for (const p of placed) {
    if (x < p.x + p.w + padW && x + w + padW > p.x && y < p.y + p.h + padH && y + h + padH > p.y) return true
  }
  return false
}

const spiralPos = (i, cx, cy, rMax) => {
  const angle = i * 2.4
  const r = Math.min(rMax, 10 + i * 2.5)
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

const buildGraphic = (data, width, height) => {
  const maxCount = Math.max(...data.map(d => d.count))
  const minCount = Math.min(...data.map(d => d.count))
  const range = maxCount - minCount || 1
  const cx = width / 2
  const cy = height / 2
  const placed = []
  const elements = []
  const sorted = [...data].sort((a, b) => b.count - a.count)

  const maxFontSize = Math.min(height * 0.12, 36)
  const minFontSize = Math.min(height * 0.04, 12)

  sorted.forEach((item, idx) => {
    const ratio = (item.count - minCount) / range
    const fontSize = minFontSize + ratio * (maxFontSize - minFontSize)
    const estW = item.word.length * fontSize * 0.65
    const estH = fontSize * 1.4
    const padW = 6
    const padH = 4
    const rMax = Math.min(width, height) * 0.45
    let found = false
    for (let attempt = 0; attempt < 600; attempt++) {
      const pos = spiralPos(attempt, cx, cy, rMax)
      const px = pos.x - estW / 2
      const py = pos.y - estH / 2
      if (px < 0 || py < 0 || px + estW > width || py + estH > height) continue
      if (!isInside(px, py, placed, padW, padH, estW, estH)) {
        placed.push({ x: px, y: py, w: estW, h: estH })
        elements.push({
          type: 'text',
          left: px,
          top: py,
          style: {
            text: item.word,
            fontSize,
            fontWeight: 'bold',
            fill: COLORS[idx % COLORS.length]
          },
          rotation: attempt % 4 === 0 ? 0 : ((-20 + (attempt * 17) % 40) * Math.PI) / 180
        })
        found = true
        break
      }
    }
    if (!found) {
      placed.push({ x: 0, y: cy, w: estW, h: estH })
      elements.push({
        type: 'text',
        left: 0,
        top: cy - estH / 2,
        style: { text: item.word, fontSize, fontWeight: 'bold', fill: COLORS[idx % COLORS.length] },
        rotation: 0
      })
    }
  })
  return elements
}

const renderWordCloud = (dom, data, isSmall) => {
  if (!dom) return
  const chart = echarts.init(dom)
  const w = dom.clientWidth || 300
  const h = isSmall ? 180 : 250
  if (!data.length) {
    chart.setOption({
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: { text: '当前时间范围内无数据', fontSize: 14, fill: '#999' }
      }]
    })
    return chart
  }
  const graphicElements = buildGraphic(data, w, h)
  chart.setOption({ graphic: graphicElements })
  return chart
}

watch(() => props.hotKeywords, async () => {
  await nextTick()
  if (keywordChartInstance) { keywordChartInstance.dispose(); keywordChartInstance = null }
  keywordChartInstance = renderWordCloud(keywordCloudRef.value, props.hotKeywords, false)
}, { deep: true, immediate: true })

watch(() => props.hotUsers, async () => {
  await nextTick()
  if (userChartInstance) { userChartInstance.dispose(); userChartInstance = null }
  userChartInstance = renderWordCloud(userCloudRef.value, props.hotUsers, true)
}, { deep: true, immediate: true })

onBeforeUnmount(() => {
  if (keywordChartInstance) keywordChartInstance.dispose()
  if (userChartInstance) userChartInstance.dispose()
})
</script>

<style scoped>
.wordcloud-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.header-actions {
  display: flex;
  gap: 10px;
}
.wordcloud-content {
  margin-top: 10px;
}
.wordcloud-area {
  height: 250px;
  border-radius: 8px;
}
.wordcloud-area.small {
  height: 180px;
}
</style>
