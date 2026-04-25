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
        <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" border style="width: 100%" @selection-change="handleSelectionChange">
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

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="showRoleDialog"
      :title="isEditMode ? '编辑角色' : '新增角色'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="roleForm.roleName"
            placeholder="请输入角色名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="数据权限" prop="dataScope">
          <el-select
            v-model="roleForm.dataScope"
            placeholder="请选择数据权限范围"
            style="width: 100%"
          >
            <el-option label="本处室" :value="1" />
            <el-option label="本单位" :value="2" />
            <el-option label="本系统" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="roleForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限配置" prop="authority">
          <div class="authority-config">
            <div v-for="(permissions, category) in authorityConfig" :key="category" class="authority-category">
              <div class="category-title">{{ getCategoryName(category) }}</div>
              <div class="permission-list">
                <el-checkbox
                  v-for="(label, key) in permissions"
                  :key="key"
                  v-model="roleForm.authority[category][key]"
                  :label="label"
                  :true-label="1"
                  :false-label="0"
                />
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRoleDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRole" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRolePageListAPI, deleteRoleAPI, batchDeleteRoleAPI, getAuthorityAPI, addRoleAPI, updateRoleAPI } from '@/api'

// 搜索表单
const searchForm = ref({
  roleName: '',
  status: ''
})

// 表格数据
const tableData = ref([])

// 选中的行
const selectedRows = ref([])

// 权限配置映射表
const authorityConfig = ref({})

// 对话框相关
const showRoleDialog = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const roleFormRef = ref(null)

const roleForm = ref({
  roleName: '',
  dataScope: 2,
  remark: '',
  status: 1,
  authority: {}
})

const roleFormRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  dataScope: [
    { required: true, message: '请选择数据权限范围', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 分页
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

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

// 加载权限配置
const loadAuthorityConfig = async () => {
  try {
    const res = await getAuthorityAPI()
    if (res.code === 1) {
      authorityConfig.value = res.data.authority || {}
      console.log('权限配置加载成功:', authorityConfig.value)
    } else {
      ElMessage.error(res.msg || '获取权限配置失败')
    }
  } catch (err) {
    ElMessage.error('获取权限配置失败，请重试')
    console.error(err)
  }
}

// 获取分类名称
const getCategoryName = (category) => {
  const categoryMap = {
    role: '角色管理',
    alert: '预警管理'
  }
  return categoryMap[category] || category
}

// 初始化权限表单
const initAuthorityForm = () => {
  const authority = {}
  Object.keys(authorityConfig.value).forEach(category => {
    authority[category] = {}
    Object.keys(authorityConfig.value[category]).forEach(key => {
      authority[category][key] = 0
    })
  })
  return authority
}

// 新增角色
const handleAdd = () => {
  isEditMode.value = false
  showRoleDialog.value = true
  roleForm.value = {
    roleName: '',
    dataScope: 2,
    remark: '',
    status: 1,
    authority: initAuthorityForm()
  }
  roleFormRef.value?.clearValidate()
}

// 提交角色表单
const handleSubmitRole = async () => {
  try {
    await roleFormRef.value?.validate()

    submitting.value = true
    const api = isEditMode.value ? updateRoleAPI : addRoleAPI
    const res = await api(roleForm.value)

    if (res.code === 1) {
      ElMessage.success(isEditMode.value ? '编辑角色成功' : '新增角色成功')
      showRoleDialog.value = false
      loadTableData()
    } else {
      ElMessage.error(res.msg || '新增角色失败')
    }
  } catch (err) {
    if (err !== false) {
      ElMessage.error('网络异常，请重试')
      console.error(err)
    }
  } finally {
    submitting.value = false
  }
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的角色')
    return
  }

  const roleNames = selectedRows.value.map(row => row.roleName).join('、')
  ElMessageBox.confirm(`确定删除选中的角色（${roleNames}）吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const roleIds = selectedRows.value.map(row => row.roleId)
      const res = await batchDeleteRoleAPI({ roleIds })
      if (res.code === 1) {
        ElMessage.success('批量删除成功')
        loadTableData()
      } else {
        ElMessage.error(res.msg || '批量删除失败')
      }
    } catch (err) {
      ElMessage.error('网络异常，请重试')
      console.error(err)
    }
  }).catch(() => {})
}

// 编辑
const handleEdit = (row) => {
  isEditMode.value = true
  showRoleDialog.value = true

  // 将 authority 字符串解析为嵌套对象，不存在则初始化为空
  let parsedAuthority = initAuthorityForm()
  if (row.authority) {
    try {
      const rawAuthority = typeof row.authority === 'string'
        ? JSON.parse(row.authority)
        : row.authority
      // 以 authorityConfig 为基准合并，确保新增权限项也能展示
      Object.keys(authorityConfig.value).forEach(category => {
        parsedAuthority[category] = {}
        Object.keys(authorityConfig.value[category]).forEach(key => {
          parsedAuthority[category][key] = rawAuthority[category]?.[key] ?? 0
        })
      })
    } catch {
      console.warn('authority 解析失败，使用默认值')
    }
  }

  roleForm.value = {
    roleId: row.roleId,
    roleName: row.roleName,
    dataScope: row.dataScope,
    remark: row.remark || '',
    status: row.status,
    authority: parsedAuthority
  }
  roleFormRef.value?.clearValidate()
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
  }).then(async () => {
    try {
      const res = await deleteRoleAPI(row.roleId)
      if (res.code === 1) {
        ElMessage.success('删除成功')
        loadTableData()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (err) {
      ElMessage.error('网络异常，请重试')
      console.error(err)
    }
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
  loadAuthorityConfig()
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

.authority-config {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background: #f5f7fa;
}

.authority-category {
  margin-bottom: 20px;
}

.authority-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.permission-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.permission-list .el-checkbox {
  margin: 0;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
