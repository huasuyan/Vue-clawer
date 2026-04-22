<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="card-header">
          <span class="card-title">信息总量</span>
          <el-icon class="info-icon"><QuestionFilled /></el-icon>
        </div>
        <div class="card-value">893,832</div>
        <div class="card-chart">
          <div class="mini-chart"></div>
        </div>
        <div class="card-footer">
          <span>文章 572,334</span>
          <span>视频 321,498</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-header">
          <span class="card-title">预警信息总量</span>
          <el-icon class="info-icon"><QuestionFilled /></el-icon>
        </div>
        <div class="card-value">593,832</div>
        <div class="card-chart">
          <div class="mini-chart bar"></div>
        </div>
        <div class="card-footer">
          <span>文章 372,334</span>
          <span>视频 221,498</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-header">
          <span class="card-title">办件总量</span>
          <el-icon class="info-icon"><QuestionFilled /></el-icon>
        </div>
        <div class="card-value">832</div>
        <div class="card-footer">
          <span>环比 <el-icon class="trend-icon"><CaretTop /></el-icon> 12%</span>
          <span>办结中 334</span>
          <span>已办结 231</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-header">
          <span class="card-title">今日信息量</span>
          <el-icon class="info-icon"><QuestionFilled /></el-icon>
        </div>
        <div class="card-value">26,560</div>
        <div class="card-footer">
          <span>同比 <el-icon class="trend-icon"><CaretTop /></el-icon> 12%</span>
          <span>文章 16,423</span>
          <span>视频 11,137</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-header">
          <span class="card-title">今日预警信息量</span>
          <el-icon class="info-icon"><QuestionFilled /></el-icon>
        </div>
        <div class="card-value">6,560</div>
        <div class="card-footer">
          <span>同比 <el-icon class="trend-icon"><CaretTop /></el-icon> 12%</span>
          <span>一级 423</span>
          <span>二级 1,137</span>
          <span>三级 5,120</span>
        </div>
      </div>
    </div>

    <!-- 地域分布和热词分析 -->
    <div class="analysis-row">
      <div class="map-section">
        <div class="section-header">
          <h3>地域分布情况</h3>
          <div class="header-actions">
            <el-button size="small">近一周</el-button>
            <el-button size="small">近一月</el-button>
            <el-date-picker size="small" type="daterange" />
            <el-button size="small">导出</el-button>
          </div>
        </div>
        <div class="map-content">
          <div class="map-tabs">
            <el-button type="primary" size="small">按色显量</el-button>
            <el-button size="small">按半径</el-button>
          </div>
          <div class="map-area">
            <div class="china-map">
              <span class="map-placeholder">中国地图热力图区域</span>
            </div>
            <div class="region-rank">
              <table>
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>地域</th>
                    <th>发文量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>广东</td><td>45</td></tr>
                  <tr><td>2</td><td>浙江</td><td>34</td></tr>
                  <tr><td>3</td><td>江苏</td><td>32</td></tr>
                  <tr><td>4</td><td>四川</td><td>28</td></tr>
                  <tr><td>5</td><td>河南</td><td>27</td></tr>
                  <tr><td>6</td><td>湖北</td><td>23</td></tr>
                  <tr><td>7</td><td>山东</td><td>18</td></tr>
                  <tr><td>8</td><td>辽宁</td><td>14</td></tr>
                  <tr><td>9</td><td>湖南</td><td>12</td></tr>
                  <tr><td>10</td><td>福建</td><td>10</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="wordcloud-section">
        <div class="section-header">
          <h3>热词分析</h3>
          <div class="header-actions">
            <el-button size="small">今天</el-button>
            <el-button size="small">近一周</el-button>
            <el-button size="small">近一月</el-button>
          </div>
        </div>
        <div class="wordcloud-content">
          <div class="wordcloud-area">
            <span class="wordcloud-placeholder">热词词云图</span>
          </div>
        </div>
        <div class="section-header" style="margin-top: 20px;">
          <h3>活跃用户</h3>

        </div>
        <div class="wordcloud-content">
          <div class="wordcloud-area small">
            <span class="wordcloud-placeholder">活跃用户词云</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 平台分布情况 -->
    <div class="platform-row">
      <div class="platform-chart">
        <div class="section-header">
          <h3>平台分布情况</h3>
          <div class="header-actions">
            <el-button size="small">今天</el-button>
            <el-button size="small">近一周</el-button>
            <el-button size="small">近一月</el-button>
            <el-button size="small">导出</el-button>
          </div>
        </div>
        <div class="chart-content">
          <div class="bar-chart">
            <span class="chart-placeholder">平台信息发布情况柱状图</span>
          </div>
        </div>
      </div>

      <div class="platform-pie">
        <div class="section-header">
          <h3>各平台信息占比</h3>
        </div>
        <div class="chart-content">
          <div class="pie-chart">
            <span class="chart-placeholder">平台占比环形图</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { QuestionFilled, CaretTop } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

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
  background: linear-gradient(to right, #e3f2fd 0%, #90caf9 50%, #42a5f5 100%);
  border-radius: 4px;
}

.mini-chart.bar {
  background: linear-gradient(to top, #fff3e0 0%, #ffb74d 50%, #ff9800 100%);
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

.analysis-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.map-section,
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

.map-content {
  position: relative;
}

.map-tabs {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  gap: 10px;
}

.map-area {
  display: flex;
  gap: 20px;
}

.china-map {
  flex: 2;
  height: 400px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder,
.chart-placeholder,
.wordcloud-placeholder {
  color: #999;
  font-size: 14px;
}

.region-rank {
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
}

.region-rank table {
  width: 100%;
  border-collapse: collapse;
}

.region-rank th {
  background: #f5f7fa;
  padding: 10px;
  text-align: left;
  font-size: 13px;
  color: #666;
  font-weight: 500;
  position: sticky;
  top: 0;
}

.region-rank td {
  padding: 10px;
  border-bottom: 1px solid #f0f2f5;
  font-size: 13px;
  color: #333;
}

.region-rank tr:hover {
  background: #f5f7fa;
}

.wordcloud-content {
  margin-top: 10px;
}

.wordcloud-area {
  height: 250px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wordcloud-area.small {
  height: 180px;
}

.platform-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.platform-chart,
.platform-pie {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-content {
  margin-top: 20px;
}

.bar-chart {
  height: 300px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-chart {
  height: 300px;
  background: #f0f2f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 1600px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .analysis-row,
  .platform-row {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

