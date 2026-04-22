<template>
  <div class="warning-records">
    <div class="records-header">
      <h2>预警记录</h2>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterTopic" placeholder="预警专题" style="width: 150px;">
        <el-option label="全部" value="" />
        <el-option label="非法文章" value="非法文章" />
        <el-option label="假冒伪劣" value="假冒伪劣" />
        <el-option label="走私" value="走私" />
      </el-select>
      <el-select v-model="filterLevel" placeholder="预警等级" style="width: 150px;">
        <el-option label="全部" value="" />
        <el-option label="高" value="高" />
        <el-option label="中" value="中" />
        <el-option label="低" value="低" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 300px;"
      />
      <el-input v-model="filterKeyword" placeholder="搜索关键词" style="width: 200px;">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleFilter">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
      <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">今日预警</div>
        <div class="stat-value">156</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本周预警</div>
        <div class="stat-value">892</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月预警</div>
        <div class="stat-value">3,421</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">高级预警</div>
        <div class="stat-value">45</div>
      </div>
    </div>

    <!-- 预警记录列表 -->
    <div class="records-table">
      <el-table :data="recordsList" stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="topicName" label="预警专题" width="120" />
        <el-table-column prop="title" label="预警内容" min-width="250">
          <template #default="scope">
            <div class="content-cell">
              <span class="content-title">{{ scope.row.title }}</span>
              <div class="content-keywords">
                <el-tag v-for="(keyword, index) in scope.row.matchedKeywords" :key="index" size="small" type="danger">
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="预警等级" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="100" />
        <el-table-column prop="platform" label="平台" width="100" />
        <el-table-column prop="author" label="发布者" width="120" />
        <el-table-column prop="publishTime" label="发布时间" width="180" />
        <el-table-column prop="warningTime" label="预警时间" width="180" />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">查看详情</el-button>
            <el-button link type="success" @click="handleProcess(scope.row)">处理</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>

    <!-- 处理对话框 -->
    <el-dialog v-model="showProcessDialog" title="处理预警" width="500px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-select v-model="processForm.result" placeholder="请选择处理结果">
            <el-option label="已处理" value="已处理" />
            <el-option label="误报" value="误报" />
            <el-option label="待跟进" value="待跟进" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="processForm.remark" type="textarea" :rows="4" placeholder="请输入处理说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProcessDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterTopic = ref('')
const filterLevel = ref('')
const dateRange = ref('')
const filterKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedRows = ref([])



const showProcessDialog = ref(false)
const processForm = ref({
  result: '',
  remark: ''
})

// 模拟数据
const recordsList = ref([
  {
    id: 1,
    topicName: '非法文章',
    title: '无证还击假牌涉案50余万元 两名生活困市负责人被采取刑事强制措施',
    matchedKeywords: ['走私', '非法'],
    level: '高',
    source: '新华网',
    platform: '网媒',
    author: '新华社记者',
    publishTime: '2024-01-15 14:30:25',
    warningTime: '2024-01-15 14:31:10',
    status: '未处理'
  },
  {
    id: 2,
    topicName: '假冒伪劣',
    title: '市场监管部门查获大批假冒名牌商品',
    matchedKeywords: ['假货', '伪劣'],
    level: '中',
    source: '人民日报',
    platform: '微博',
    author: '人民日报',
    publishTime: '2024-01-15 13:20:18',
    warningTime: '2024-01-15 13:21:05',
    status: '处理中'
  },
  {
    id: 3,
    topicName: '走私',
    title: '海关查获走私冻品案件',
    matchedKeywords: ['走私'],
    level: '高',
    source: '央视新闻',
    platform: '网媒',
    author: '央视记者',
    publishTime: '2024-01-15 10:15:42',
    warningTime: '2024-01-15 10:16:30',
    status: '已处理'
  }
])

const getLevelType = (level) => {
  const typeMap = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[level] || 'info'
}

const getStatusType = (status) => {
  const typeMap = {
    '未处理': 'danger',
    '处理中': 'warning',
    '已处理': 'success'
  }
  return typeMap[status] || 'info'
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleFilter = () => {
  console.log('筛选:', filterTopic.value, filterLevel.value, dateRange.value, filterKeyword.value)
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterTopic.value = ''
  filterLevel.value = ''
  dateRange.value = ''
  filterKeyword.value = ''
}

const handleView = (row) => {
  console.log('查看详情:', row)
  ElMessage.info('查看详情功能开发中')
}

const handleProcess = (row) => {
  processForm.value = {
    result: '',
    remark: ''
  }
  showProcessDialog.value = true
}

const handleSubmitProcess = () => {
  if (!processForm.value.result) {
    ElMessage.warning('请选择处理结果')
    return
  }
  ElMessage.success('处理成功')
  showProcessDialog.value = false
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条预警记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

</script>

<style scoped>
.warning-records {
  padding: 20px;
  background: #fff;
}

.records-header {
  margin-bottom: 20px;
}

.records-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
  color: #fff;
}

.stat-card.danger {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
}

.records-table {
  margin-bottom: 20px;
}

.content-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.content-title {
  font-size: 14px;
  color: #333;
}

.content-keywords {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}
</style>

