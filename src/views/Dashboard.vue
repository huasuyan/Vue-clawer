<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>数据大屏</h2>
      <div class="header-right">
        <span class="update-time" v-if="lastUpdateTime">上次更新: {{ lastUpdateTime }}</span>
        <el-button type="primary" :loading="refreshing" @click="handleRefresh">
          <el-icon style="margin-right: 4px;"><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <StatsCards :summary="summaryData" :trend-data="trendData" />

    <div class="analysis-row">
      <RegionMap
        :region-data="regionData"
        @stat-type-change="loadRegion"
        @date-change="loadRegionByDate"
      />
      <HotWords
        :hot-keywords="hotKeywords"
        :hot-users="hotUsers"
        @stat-type-change="loadHotWords"
      />
    </div>

    <PlatformDistribution
      :bar-data="platformBarData"
      :pie-data="platformPieData"
      @filter-change="loadPlatform"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import {
  getDashboardSummary,
  getDashboardTrend,
  getDashboardPlatform,
  getDashboardRegion,
  getDashboardHotWords,
  refreshDashboard
} from '@/api/index.js'
import StatsCards from '@/components/dashboard/StatsCards.vue'
import RegionMap from '@/components/dashboard/RegionMap.vue'
import HotWords from '@/components/dashboard/HotWords.vue'
import PlatformDistribution from '@/components/dashboard/PlatformDistribution.vue'

const summaryData = ref({})
const trendData = ref({ dates: [], newsCounts: [], alertCounts: [] })
const regionData = ref([])
const hotKeywords = ref([])
const hotUsers = ref([])
const platformBarData = ref([])
const platformPieData = ref([])
const lastUpdateTime = ref('')
const refreshing = ref(false)

let pollTimer = null
const defaultStatType = 'daily'

const loadSummary = async () => {
  try {
    const res = await getDashboardSummary()
    if (res.code === 1) {
      summaryData.value = res.data || {}
    }
  } catch (e) {
    console.error('Failed to load summary:', e)
  }
}

const loadTrend = async (days = 7) => {
  try {
    const res = await getDashboardTrend(days)
    if (res.code === 1) {
      trendData.value = res.data || { dates: [], newsCounts: [], alertCounts: [] }
    }
  } catch (e) {
    console.error('Failed to load trend:', e)
  }
}

const loadRegion = async (statType = defaultStatType) => {
  try {
    const res = await getDashboardRegion({ statType })
    if (res.code === 1) {
      regionData.value = res.data || []
    }
  } catch (e) {
    console.error('Failed to load region:', e)
  }
}

const loadRegionByDate = async ({ startDate, endDate }) => {
  if (!startDate && !endDate) return
  try {
    const res = await getDashboardRegion({
      statType: 'daily',
      startDate,
      endDate
    })
    if (res.code === 1) {
      regionData.value = res.data || []
    }
  } catch (e) {
    console.error('Failed to load region by date:', e)
  }
}

const loadPlatform = async (filter = { statType: defaultStatType }) => {
  try {
    const res = await getDashboardPlatform(filter)
    if (res.code === 1) {
      const data = res.data || {}
      platformBarData.value = data.barData || []
      platformPieData.value = data.pieData || []
    }
  } catch (e) {
    console.error('Failed to load platform:', e)
  }
}

const loadHotWords = async (statType = defaultStatType) => {
  try {
    const [keywordRes, userRes] = await Promise.all([
      getDashboardHotWords({ statType, wordType: 'keyword' }),
      getDashboardHotWords({ statType, wordType: 'user' })
    ])
    if (keywordRes.code === 1) {
      hotKeywords.value = keywordRes.data || []
    }
    if (userRes.code === 1) {
      hotUsers.value = userRes.data || []
    }
  } catch (e) {
    console.error('Failed to load hot words:', e)
  }
}

const loadAllData = () => {
  Promise.all([
    loadSummary(),
    loadTrend(),
    loadRegion(),
    loadPlatform(),
    loadHotWords()
  ])
  lastUpdateTime.value = new Date().toLocaleTimeString()
}

const handleRefresh = async () => {
  refreshing.value = true
  try {
    await refreshDashboard()
    loadAllData()
  } catch (e) {
    console.error('Refresh failed:', e)
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadAllData()
  pollTimer = setInterval(() => {
    getDashboardSummary().then(res => {
      if (res.code === 1) {
        summaryData.value = res.data || {}
        lastUpdateTime.value = new Date().toLocaleTimeString()
      }
    }).catch(() => {})
  }, 30000)
})

onBeforeUnmount(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.dashboard-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.update-time {
  font-size: 13px;
  color: #999;
}
.analysis-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.platform-row {
  display: block;
  margin-bottom: 20px;
}
@media (max-width: 1600px) {
  .stats-cards { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1200px) {
  .analysis-row,
  .platform-row {
    grid-template-columns: 1fr;
  }
}
</style>
