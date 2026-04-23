<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <el-button type="primary" @click="handleAdd">+ 新增用户</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchForm.keyword" placeholder="搜索用户名/手机号" clearable style="width: 200px;">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px;">
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 用户列表 -->
    <el-table :data="userList" stripe style="width: 100%;">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="userName" label="用户名" min-width="120" />
      <el-table-column prop="realName" label="真实姓名" min-width="100" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="email" label="邮箱" min-width="150" show-overflow-tooltip />
      <el-table-column prop="roleName" label="角色" width="120">
        <template #default="scope">
          <el-tag size="small">{{ scope.row.roleName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'" size="small">
            {{ scope.row.status === '1' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
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
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="formData.userName" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formData.roleId" placeholder="请选择角色">
            <el-option v-for="role in roleList" :key="role.roleId" :label="role.roleName" :value="role.roleId" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = ref({
  keyword: '',
  status: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 用户列表
const userList = ref([])

// 角色列表
const roleList = ref([
  { roleId: 1, roleName: '管理员' },
  { roleId: 2, roleName: '普通用户' },
  { roleId: 3, roleName: '访客' }
])

// 对话框
const showDialog = ref(false)
const dialogTitle = ref('新增用户')
const isEdit = ref(false)

// 表单��据
const formData = ref({
  userName: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  roleId: '',
  status: '1'
})

// 模拟数据
userList.value = [
  { userId: 1, userName: 'admin', realName: '管理员', phone: '13800138000', email: 'admin@example.com', roleName: '管理员', status: '1', createTime: '2024-01-15 10:30:00' },
  { userId: 2, userName: 'zhangsan', realName: '张三', phone: '13800138001', email: 'zhang@example.com', roleName: '普通用户', status: '1', createTime: '2024-01-14 09:20:00' },
  { userId: 3, userName: 'lisi', realName: '李四', phone: '13800138002', email: 'li@example.com', roleName: '普通用户', status: '0', createTime: '2024-01-13 14:45:00' }
]

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用户'
  isEdit.value = false
  formData.value = { userName: '', password: '', realName: '', phone: '', email: '', roleId: '', status: '1' }
  showDialog.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  formData.value = {
    userId: row.userId,
    userName: row.userName,
    password: '',
    realName: row.realName,
    phone: row.phone,
    email: row.email,
    roleId: row.roleId || '',
    status: row.status
  }
  showDialog.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除用户"${row.userName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = userList.value.findIndex(u => u.userId === row.userId)
    if (index !== -1) userList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 查询
const handleSearch = () => {
  ElMessage.success('查询成功')
}

// 重置
const handleReset = () => {
  searchForm.value = { keyword: '', status: '' }
  ElMessage.success('重置成功')
}

// 提交
const handleSubmit = () => {
  if (!formData.value.userName) {
    ElMessage.warning('请输入用户名')
    return
  }
  ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
  showDialog.value = false
}
</script>

<style scoped>
.user-management {
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
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>