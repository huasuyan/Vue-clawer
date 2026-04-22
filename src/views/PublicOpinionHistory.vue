<template>
  <div class="public-opinion-history">
    <div class="history-header">
      <h2>检索记录</h2>
      <el-button type="primary" @click="handleNewSearch">新建检索</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索检索记录" style="width: 300px;">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 记录列表 -->
    <div class="history-table">
      <el-table :data="historyList" stripe style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="keyword" label="检索关键词" min-width="150" />
        <el-table-column prop="timeRange" label="时间范围" width="200" />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="resultCount" label="结果数量" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已完成' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 模拟数据
const historyList = ref([
  {
    id: 1,
    keyword: '网络安全',
    timeRange: '2024-01-01 至 2024-01-15',
    source: '全部',
    resultCount: 1256,
    createTime: '2024-01-15 14:30:25',
    status: '已完成'
  },
  {
    id: 2,
    keyword: '数据泄露',
    timeRange: '2024-01-10 至 2024-01-15',
    source: '微博',
    resultCount: 856,
    createTime: '2024-01-15 13:20:18',
    status: '已完成'
  },
  {
    id: 3,
    keyword: '舆情监测',
    timeRange: '2024-01-08 至 2024-01-15',
    source: '微信',
    resultCount: 2341,
    createTime: '2024-01-15 10:15:42',
    status: '处理中'
  },
  {
    id: 4,
    keyword: '社会热点',
    timeRange: '2024-01-05 至 2024-01-15',
    source: '全部',
    resultCount: 5678,
    createTime: '2024-01-14 16:45:30',
    status: '已完成'
  },
  {
    id: 5,
    keyword: '政策解读',
    timeRange: '2024-01-01 至 2024-01-15',
    source: '网媒',
    resultCount: 3421,
    createTime: '2024-01-14 09:20:15',
    status: '已完成'
  }
])

const handleNewSearch = () => {
  router.push('/public-opinion/search')
}

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value)
  ElMessage.success('搜索功能开发中')
}

const handleView = (row) => {
  console.log('查看:', row)
  router.push('/public-opinion/search')
}

const handleEdit = (row) => {
  console.log('编辑:', row)
  ElMessage.info('编辑功能开发中')
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条检索记录吗？', '提示', {
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
.public-opinion-history {
  padding: 20px;
  background: #fff;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.history-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}
</style>

