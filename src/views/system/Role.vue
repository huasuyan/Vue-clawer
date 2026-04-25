<template>
  <div class="role-container">
    <div class="page-header">
      <h2>角色管理</h2>
    </div>

    <div class="content-panel">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="角色名称:">
            <el-input v-model="searchForm.roleName" placeholder="请输入" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态:">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 200px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">新增角色</el-button>
        <el-button @click="handleBatchEdit">编辑</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="dataScopeText" label="数据权限" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operateTime" label="操作时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button link type="primary" @click="handleViewUsers(row)">查看用户</el-button>
          </template>
        </el-table-column>
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRolePageListAPI } from '@/api'

// 搜索表单
const searchForm = ref({
  roleName: '',
  status: ''
})

// 表格数据
const tableData = ref([])

// 分页
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 查询
const handleSearch = () => {
  pagination.value.page = 1
  loadTableData()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    roleName: '',
    status: ''
  }
  pagination.value.page = 1
  loadTableData()
}

// 加载表格数据
const loadTableData = async () => {
  try {
    const res = await getRolePageListAPI({
      pageNum: pagination.value.page,
      pageSize: pagination.value.pageSize,
      roleName: searchForm.value.roleName,
      status: searchForm.value.status
    })

    if (res.code === 1) {
      tableData.value = res.data.list || []
      pagination.value.total = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取角色列表失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

// 新增角色
const handleAdd = () => {
  ElMessage.info('打开新增角色对话框')
}

// 批量编辑
const handleBatchEdit = () => {
  ElMessage.info('批量编辑')
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑角色: ${row.roleName}`)
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看角色: ${row.roleName}`)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除角色 ${row.roleName} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadTableData()
  }).catch(() => {})
}

// 查看用户
const handleViewUsers = (row) => {
  ElMessage.info(`查看角色 ${row.roleName} 的用户列表`)
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

// 页面加载时获取数据
onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.role-container {
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

.toolbar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
