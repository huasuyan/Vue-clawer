<template>
  <div class="role-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">角色管理</h2>
      <el-button type="primary" @click="handleAdd">+ 新增角色</el-button>
    </div>

    <!-- 角色列表 -->
    <el-table :data="roleList" stripe style="width: 100%;">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="roleId" label="角色ID" width="100" />
      <el-table-column prop="roleName" label="角色名称" min-width="120" />
      <el-table-column prop="roleDesc" label="角色描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="userCount" label="用户数" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'" size="small">
            {{ scope.row.status === '1' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="primary" @click="handlePermission(scope.row)">权限配置</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="500px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="角色名称" required>
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="formData.roleDesc" type="textarea" :rows="3" placeholder="请输入角色描述" />
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

    <!-- 权限配置对话框 -->
    <el-dialog v-model="showPermissionDialog" title="权限配置" width="600px">
      <div class="permission-info">
        <p>角色：<strong>{{ currentRole.roleName }}</strong></p>
      </div>
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        style="max-height: 400px; overflow-y: auto;"
      />
      <template #footer>
        <el-button @click="showPermissionDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 角色列表
const roleList = ref([])

// 对话框
const showDialog = ref(false)
const dialogTitle = ref('新增角色')

// 权限对话框
const showPermissionDialog = ref(false)
const currentRole = ref({})
const treeRef = ref(null)

// 树形配置
const treeProps = {
  label: 'name',
  children: 'children'
}

// 权限树
const permissionTree = ref([
  {
    id: '1',
    name: '舆情监测',
    children: [
      { id: '1-1', name: '舆情检索' },
      { id: '1-2', name: '检索记录' }
    ]
  },
  {
    id: '2',
    name: '舆情预警',
    children: [
      { id: '2-1', name: '预警专题配置' },
      { id: '2-2', name: '预警记录' }
    ]
  },
  {
    id: '3',
    name: '舆情分析',
    children: [
      { id: '3-1', name: '舆情报告列表' },
      { id: '3-2', name: '舆情报告设置' }
    ]
  },
  {
    id: '4',
    name: '办件管理',
    children: [
      { id: '4-1', name: '办件列表' },
      { id: '4-2', name: '办件处理' }
    ]
  },
  {
    id: '5',
    name: '系统管理',
    children: [
      { id: '5-1', name: '用户管理' },
      { id: '5-2', name: '角色管理' },
      { id: '5-3', name: '日志管理' }
    ]
  }
])

// 表单数据
const formData = ref({
  roleId: '',
  roleName: '',
  roleDesc: '',
  status: '1'
})

// 模拟数据
roleList.value = [
  { roleId: 1, roleName: '管理员', roleDesc: '系统管理员，拥有所有权限', userCount: 3, status: '1', createTime: '2024-01-01 00:00:00' },
  { roleId: 2, roleName: '普通用户', roleDesc: '普通用户，可使用舆情监测和预警功能', userCount: 15, status: '1', createTime: '2024-01-05 10:20:00' },
  { roleId: 3, roleName: '访客', roleDesc: '只读权限，可查看舆情信息', userCount: 5, status: '0', createTime: '2024-01-10 14:30:00' }
]

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  formData.value = { roleId: '', roleName: '', roleDesc: '', status: '1' }
  showDialog.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  formData.value = { ...row }
  showDialog.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除角色"${row.roleName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = roleList.value.findIndex(r => r.roleId === row.roleId)
    if (index !== -1) roleList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 权限配置
const handlePermission = (row) => {
  currentRole.value = row
  showPermissionDialog.value = true
}

// 保存权限
const handleSavePermission = () => {
  const checkedKeys = treeRef.value.getCheckedKeys()
  console.log('保存的权限:', checkedKeys)
  ElMessage.success('权限保存成功')
  showPermissionDialog.value = false
}

// 提交
const handleSubmit = () => {
  if (!formData.value.roleName) {
    ElMessage.warning('请输入角色名称')
    return
  }
  ElMessage.success(dialogTitle.value === '新增角色' ? '新增成功' : '修改成功')
  showDialog.value = false
}
</script>

<style scoped>
.role-management {
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

.permission-info {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>