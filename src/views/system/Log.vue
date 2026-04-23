<template>
  <div class="log-container">
    <div class="page-header">
      <h2>操作日志</h2>
    </div>

    <div class="content-panel">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :model="searchForm">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="账号:">
                <el-input v-model="searchForm.account" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="姓名:">
                <el-input v-model="searchForm.name" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所属组织:">
                <el-input v-model="searchForm.organization" placeholder="请选择" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="登录IP:">
                <el-input v-model="searchForm.loginIp" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="访问路径:">
                <el-input v-model="searchForm.path" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="操作:">
                <el-input v-model="searchForm.operation" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="操作时间:">
                <el-date-picker
                  v-model="searchForm.operateTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleExport">导出</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="account" label="账号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="organization" label="所属组织" />
        <el-table-column prop="loginIp" label="登录IP" />
        <el-table-column prop="path" label="访问路径" />
        <el-table-column prop="operation" label="操作" />
        <el-table-column prop="operateTime" label="操作时间" width="160" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, prev, pager, next, sizes, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = ref({
  account: '',
  name: '',
  organization: '',
  loginIp: '',
  path: '',
  operation: '',
  operateTime: ''
})

// 表格数据
const tableData = ref([
  { account: 'limin', name: '李敏', organization: '稽查大队', loginIp: '10.100.10.100', path: '', operation: '登录', operateTime: '2024-02-11 10:00:00' },
  { account: 'wangshiwei', name: '王世伟', organization: '稽查大队', loginIp: '10.100.10.100', path: '', operation: '登出', operateTime: '2024-02-11 10:00:00' },
  { account: 'suncheng', name: '孙成', organization: '稽查大队', loginIp: '10.100.10.100', path: '', operation: '新增组织架构', operateTime: '2024-02-11 10:00:00' },
  { account: 'lixi', name: '李西', organization: '稽查大队', loginIp: '10.100.10.100', path: '', operation: '新增用户', operateTime: '2024-02-11 10:00:00' },
  { account: 'wangwu', name: '王五', organization: '稽查大队', loginIp: '10.100.10.100', path: '', operation: '新增用户', operateTime: '2024-02-11 10:00:00' }
])

// 分页
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 10
})

// 查询
const handleSearch = () => {
  pagination.value.page = 1
  loadTableData()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    account: '',
    name: '',
    organization: '',
    loginIp: '',
    path: '',
    operation: '',
    operateTime: ''
  }
  loadTableData()
}

// 加载表格数据
const loadTableData = () => {
  // TODO: 调用API获取数据
  console.log('加载数据', searchForm.value, pagination.value)
}

// 导出
const handleExport = () => {
  ElMessage.info('导出操作日志')
}

// 分页变化
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  loadTableData()
}

const handleCurrentChange = (val) => {
  pagination.value.page = val
  loadTableData()
}
</script>

<style scoped>
.log-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  background: #fff;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 4px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.content-panel {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 16px;
}

.search-form :deep(.el-form-item__label) {
  width: 80px;
}

.toolbar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
