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
import 'echarts-wordcloud'

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

const switchType = (type) => {
  activeStatType.value = type
  emit('statTypeChange', type)
}

const renderWordCloud = (dom, data) => {
  if (!dom || !data.length) return
  const chart = echarts.init(dom)
  const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']
  const option = {
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      sizeRange: [12, 40],
      rotationRange: [-30, 30],
      rotationStep: 15,
      gridSize: 8,
      left: 'center',
      top: 'center',
      right: null,
      bottom: null,
      width: '90%',
      height: '90%',
      drawOutOfBound: false,
      shrinkToFit: true,
      textStyle: {
        color: () => colors[Math.floor(Math.random() * colors.length)]
      },
      data: data.map(item => ({
        name: item.word,
        value: item.count,
        textStyle: {
          color: colors[Math.floor(Math.random() * colors.length)]
        }
      }))
    }]
  }
  chart.setOption(option)
  return chart
}

watch(() => props.hotKeywords, async () => {
  await nextTick()
  if (keywordChartInstance) { keywordChartInstance.dispose(); keywordChartInstance = null }
  keywordChartInstance = renderWordCloud(keywordCloudRef.value, props.hotKeywords)
}, { deep: true, immediate: true })

watch(() => props.hotUsers, async () => {
  await nextTick()
  if (userChartInstance) { userChartInstance.dispose(); userChartInstance = null }
  userChartInstance = renderWordCloud(userCloudRef.value, props.hotUsers)
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
