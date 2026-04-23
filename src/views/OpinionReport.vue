<template>
  <div class="opinion-report">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">舆情报告</h2>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-row">
        <div class="search-item">
          <label>报告名称：</label>
          <el-input v-model="searchForm.reportName" placeholder="请输入" clearable style="width: 180px"></el-input>
        </div>
        <div class="search-item">
          <label>关键词：</label>
          <el-input v-model="searchForm.keywords" placeholder="请输入" clearable style="width: 180px"></el-input>
        </div>
        <div class="search-item">
          <label>报告类型：</label>
          <el-select v-model="searchForm.reportType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="即时报告" value="即时报告"></el-option>
            <el-option label="定时报告" value="定时报告"></el-option>
          </el-select>
        </div>
        <div class="search-item">
          <label>报告主题：</label>
          <el-select v-model="searchForm.reportTheme" placeholder="请选择" clearable style="width: 150px">
            <el-option label="政策解读" value="政策解读"></el-option>
            <el-option label="舆论热点" value="舆论热点"></el-option>
            <el-option label="行业分析" value="行业分析"></el-option>
            <el-option label="品牌监测" value="品牌监测"></el-option>
          </el-select>
        </div>
        <div class="search-buttons">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 报告列表 -->
    <el-table :data="reportList" stripe style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="reportName" label="报告名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="reportType" label="报告类型" width="100" />
      <el-table-column prop="monitorKeywords" label="监测关键词" min-width="150">
        <template #default="scope">
          <el-tag v-for="(keyword, index) in scope.row.monitorKeywords" :key="index" size="small" style="margin-right: 5px;">
            {{ keyword }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reportTheme" label="报告主题" width="100" />
      <el-table-column prop="createTime" label="生成时间" width="160" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 报告详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="报告详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="报告名称">{{ currentReport.reportName }}</el-descriptions-item>
        <el-descriptions-item label="报告类型">{{ currentReport.reportType }}</el-descriptions-item>
        <el-descriptions-item label="报告主题">{{ currentReport.reportTheme }}</el-descriptions-item>
        <el-descriptions-item label="生成时间">{{ currentReport.createTime }}</el-descriptions-item>
        <el-descriptions-item label="监测关键词" :span="2">
          <el-tag v-for="(keyword, index) in currentReport.monitorKeywords" :key="index" size="small" style="margin-right: 5px;">
            {{ keyword }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="报告内容" :span="2">
          <div class="report-content">{{ currentReport.content || '暂无内容' }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = ref({
  reportName: '',
  keywords: '',
  reportType: '',
  reportTheme: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 选中行
const selectedRows = ref([])

// 报告列表
const reportList = ref([])

// 报告详情
const showDetailDialog = ref(false)
const currentReport = ref({})

// 模拟数据
const mockData = [
  {
    id: 1,
    reportName: '2024年Q1政策解读报告',
    reportType: '即时报告',
    monitorKeywords: ['政策', '法规', '条例'],
    reportTheme: '政策解读',
    createTime: '2024-01-15 10:30:00',
    content: '本报告对2024年第一季度发布的主要政策进行了解读分析...'
  },
  {
    id: 2,
    reportName: '热点事件周报-第12期',
    reportType: '定时报告',
    monitorKeywords: ['热点', '舆论', '关注'],
    reportTheme: '舆论热点',
    createTime: '2024-01-14 09:00:00',
    content: '本周舆论热点主要集中在...'
  },
  {
    id: 3,
    reportName: '行业趋势分析报告',
    reportType: '即时报告',
    monitorKeywords: ['行业', '趋势', '市场'],
    reportTheme: '行业分析',
    createTime: '2024-01-13 14:20:00',
    content: '本报告分析了当前行业发展趋势...'
  },
  {
    id: 4,
    reportName: '品牌声誉监测周报',
    reportType: '定时报告',
    monitorKeywords: ['品牌', '声誉', '口碑'],
    reportTheme: '品牌监测',
    createTime: '2024-01-12 08:00:00',
    content: '本周品牌声誉监测结果如下...'
  },
  {
    id: 5,
    reportName: '新能源汽车政策研究报告',
    reportType: '即时报告',
    monitorKeywords: ['新能源', '汽车', '补贴'],
    reportTheme: '政策解读',
    createTime: '2024-01-10 11:45:00',
    content: '本报告对新能源汽车最新政策进行了解读...'
  }
]

// 加载数据
const loadData = () => {
  reportList.value = mockData
  pagination.value.total = mockData.length
}

// 查询
const handleSearch = () => {
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    reportName: '',
    keywords: '',
    reportType: '',
    reportTheme: ''
  }
  loadData()
}

// 选中变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 查看详情
const handleView = (row) => {
  currentReport.value = { ...row }
  showDetailDialog.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除报告"${row.reportName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 分页
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.opinion-report {
  background: white;
  padding: 20px;
  border-radius: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.search-bar {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  white-space: nowrap;
  font-size: 14px;
  color: #606266;
}

.search-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.report-content {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
}
</style>