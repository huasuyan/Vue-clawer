<template>
  <div class="platform-box">
    <div class="section-header">
      <h3>平台分布情况</h3>
      <div class="header-actions">
        <el-button
          v-for="item in statTypeOptions"
          :key="item.value"
          :type="activeStatType === item.value ? 'primary' : ''"
          size="small"
          @click="switchStatType(item.value)"
        >{{ item.label }}</el-button>
        <el-date-picker size="small" type="date" v-model="startDate" placeholder="开始日期" @change="onDateChange" value-format="YYYY-MM-DD" />
        <el-date-picker size="small" type="date" v-model="endDate" placeholder="结束日期" @change="onDateChange" value-format="YYYY-MM-DD" />
        <el-button size="small" @click="$emit('export')">导出</el-button>
      </div>
    </div>
    <div class="platform-body">
      <div class="bar-wrapper">
        <div ref="barChartRef" class="bar-chart"></div>
      </div>
      <div class="pie-wrapper">
        <div ref="pieChartRef" class="pie-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  barData: {
    type: Array,
    default: () => []
  },
  pieData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['filterChange', 'export'])

const statTypeOptions = [
  { label: '今天', value: 'daily' },
  { label: '近一周', value: 'weekly' },
  { label: '近一月', value: 'monthly' }
]

const activeStatType = ref('daily')
const startDate = ref(null)
const endDate = ref(null)
const barChartRef = ref(null)
const pieChartRef = ref(null)
let barChartInstance = null
let pieChartInstance = null

const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']

const emitFilter = () => {
  emit('filterChange', {
    statType: activeStatType.value,
    startDate: startDate.value,
    endDate: endDate.value
  })
}

const switchStatType = (type) => {
  activeStatType.value = type
  startDate.value = null
  endDate.value = null
  emitFilter()
}

const onDateChange = () => {
  emitFilter()
}

const renderBar = () => {
  if (!barChartRef.value) return
  if (barChartInstance) barChartInstance.dispose()
  barChartInstance = echarts.init(barChartRef.value)

  if (!props.barData.length) {
    barChartInstance.setOption({
      xAxis: { show: false },
      yAxis: { show: false },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'center',
        style: { text: '当前时间范围内无数据', fill: '#999', fontSize: 14 }
      }
    })
    return
  }

  const sorted = [...props.barData].sort((a, b) => {
    const totalB = (b.sensitive || 0) + (b.neutral || 0) + (b.normal || 0)
    const totalA = (a.sensitive || 0) + (a.neutral || 0) + (a.normal || 0)
    return totalA - totalB
  })
  const platforms = sorted.map(d => d.source)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: { data: ['敏感', '中性', '正常'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 12 }
    },
    yAxis: {
      type: 'category',
      data: platforms,
      axisLabel: { fontSize: 12 }
    },
    series: [
      {
        name: '敏感',
        type: 'bar',
        stack: 'total',
        color: '#ee6666',
        barCategoryGap: '50%',
        barWidth: '40%',
        data: sorted.map(d => d.sensitive)
      },
      {
        name: '中性',
        type: 'bar',
        stack: 'total',
        color: '#fac858',
        data: sorted.map(d => d.neutral)
      },
      {
        name: '正常',
        type: 'bar',
        stack: 'total',
        color: '#91cc75',
        data: sorted.map(d => d.normal)
      }
    ]
  }
  barChartInstance.setOption(option)
}

const renderPie = () => {
  if (!pieChartRef.value) return
  if (pieChartInstance) pieChartInstance.dispose()
  pieChartInstance = echarts.init(pieChartRef.value)

  if (!props.pieData.length) {
    pieChartInstance.setOption({
      series: [{
        type: 'pie',
        radius: ['48%', '58%'],
        center: ['50%', '50%'],
        data: [{ value: 1, name: '', itemStyle: { color: '#e8e8e8' } }],
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: false },
        tooltip: { show: false },
        silent: true
      }],
      graphic: {
        type: 'text',
        left: 'center',
        top: 'center',
        style: { text: '当前时间范围内无数据', fill: '#999', fontSize: 14 }
      }
    })
    return
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => `${params.name}: ${params.value} (${params.percent}%)`
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '58%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' }
        },
        labelLine: { show: false },
        data: props.pieData.map((item, index) => ({
          value: item.value,
          name: item.source,
          itemStyle: { color: colors[index % colors.length] }
        }))
      }
    ]
  }
  pieChartInstance.setOption(option)
}

watch(() => props.barData, async () => {
  await nextTick()
  renderBar()
}, { deep: true, immediate: true })

watch(() => props.pieData, async () => {
  await nextTick()
  renderPie()
}, { deep: true, immediate: true })

onBeforeUnmount(() => {
  if (barChartInstance) barChartInstance.dispose()
  if (pieChartInstance) pieChartInstance.dispose()
})
</script>

<style scoped>
.platform-box {
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
.platform-body {
  display: flex;
  gap: 20px;
}
.bar-wrapper {
  flex: 2;
}
.pie-wrapper {
  flex: 1;
}
.bar-chart {
  height: 300px;
}
.pie-chart {
  height: 300px;
}
</style>
