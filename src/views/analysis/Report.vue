<template>
  <div class="report-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-item">
        <span class="label">报告名称:</span>
        <el-input v-model="searchForm.name" placeholder="请输入" clearable />
      </div>
      <div class="search-item">
        <span class="label">关键词:</span>
        <el-input v-model="searchForm.keyword" placeholder="请输入" clearable />
      </div>
      <div class="search-item">
        <span class="label">报告生成:</span>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </div>
      <div class="search-buttons">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button @click="handleBatchDownload">下载</el-button>
      <el-button @click="handleBatchDelete">删除</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="报告名称" min-width="200" />
      <el-table-column prop="keywords" label="监测关键词" min-width="200" />
      <el-table-column prop="createTime" label="生成时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button text type="primary" @click="handleView(row)">查看</el-button>
            <el-button text type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看报告对话框 -->
    <el-dialog
      v-model="showViewDialog"
      title="报告详情"
      width="80%"
      top="5vh"
    >
      <div class="report-content">
        <h3>{{ currentReport.name }}</h3>
        <div class="report-info">
          <p><strong>监测关键词：</strong>{{ currentReport.keywords }}</p>
          <p><strong>生成时间：</strong>{{ currentReport.createTime }}</p>
        </div>
        <div class="report-detail">
          <h4>报告内容</h4>
          <p>{{ currentReport.content }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = ref({
  name: '',
  keyword: '',
  dateRange: []
})

const tableData = ref([
  {
    id: 1,
    name: '淮东舆情办件周监测（四周）',
    keywords: '上海、淮东、石家庄、聊城',
    createTime: '2023-11-11 10:00:00',
    content: '这是报告的详细内容...'
  },
  {
    id: 2,
    name: '淮东舆情办件周监测',
    keywords: '上海、淮东、石家庄、聊城',
    createTime: '2023-11-11 10:00:00',
    content: '这是报告的详细内容...'
  },
  {
    id: 3,
    name: '淮东舆情办件周监测（三周）',
    keywords: '上海、淮东、石家庄、聊城',
    createTime: '2023-11-11 10:00:00',
    content: '这是报告的详细内容...'
  },
  {
    id: 4,
    name: '淮东舆情办件周监测（二周）',
    keywords: '上海、淮东、石家庄、聊城',
    createTime: '2023-11-11 10:00:00',
    content: '这是报告的详细内容...'
  },
  {
    id: 5,
    name: '淮东舆情办件周监测（一周）',
    keywords: '上海、淮东、石家庄、聊城',
    createTime: '2023-11-11 10:00:00',
    content: '这是报告的详细内容...'
  }
])

const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(10)
const showViewDialog = ref(false)
const currentReport = ref({})

const handleSearch = () => {
  ElMessage.info('搜索功能开发中')
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    keyword: '',
    dateRange: []
  }
  ElMessage.success('已重置')
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleBatchDownload = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要下载的报告')
    return
  }
  ElMessage.success(`已下载${selectedRows.value.length}个报告`)
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的报告')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个报告吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleView = (row) => {
  currentReport.value = row
  showViewDialog.value = true
}

const handleDownload = (row) => {
  ElMessage.success(`正在下载：${row.name}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      total.value--
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSizeChange = (val) => {
  pageSize.value = val
  ElMessage.info(`每页显示${val}条`)
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  ElMessage.info(`当前第${val}页`)
}
</script>

<style scoped>
.report-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item .label {
  white-space: nowrap;
  color: #666;
  font-size: 14px;
}

.search-item .el-input {
  width: 200px;
}

.search-item .el-date-picker {
  width: 280px;
}

.search-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.report-content {
  padding: 20px;
}

.report-content h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.report-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

.report-info p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.report-detail h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.report-detail p {
  color: #666;
  line-height: 1.8;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: flex-start;
}

.action-buttons .el-button {
  padding: 0 8px;
  font-size: 13px;
}
</style>
