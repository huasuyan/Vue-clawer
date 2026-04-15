<template>
  <div class="overview-container">
    <h2>运行概览</h2>
    <div class="stats-card">
      <div class="stat-item">
        <h3>总任务数</h3>
        <p>100</p>
      </div>
      <div class="stat-item">
        <h3>运行中任务</h3>
        <p>25</p>
      </div>
      <div class="stat-item">
        <h3>今日执行</h3>
        <p>120</p>
      </div>
      <div class="stat-item">
        <h3>成功率</h3>
        <p>98%</p>
      </div>
    </div>
    <div class="chart-area">
      <h3>执行趋势</h3>
      <div class="chart-placeholder">
        <p>图表区域</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 运行概览页面逻辑
</script>

<style scoped>
.overview-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-card {
  display: flex;
  margin: 20px 0;
  gap: 20px;
}

.stat-item {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}

.stat-item h3 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.stat-item p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.chart-area {
  margin-top: 30px;
}

.chart-placeholder {
  height: 300px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
</style>