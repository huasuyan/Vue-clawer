<template>
  <div class="organization-container">
    <div class="page-header">
      <h2>组织架构</h2>
    </div>

    <div class="content-layout">
      <!-- 左侧组织树 -->
      <div class="tree-panel">
        <div class="tree-search">
          <el-input
            v-model="treeSearchText"
            placeholder="请输入公司、部门、员工名称"
            :prefix-icon="Search"
            clearable
          />
        </div>
        <div class="tree-actions">
          <el-button @click="handleAddCompany">新增市级局（公司）</el-button>
          <el-button @click="handleAddDepartment">新增部门（处室）</el-button>
        </div>
        <div class="tree-container">
          <el-tree
            :data="treeData"
            :props="treeProps"
            ref="treeRef"
            node-key="deptId"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
            @node-contextmenu="handleNodeRightClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node" :class="{ 'tree-node-disabled': data.status === 0 }">
                <el-icon><OfficeBuilding /></el-icon>
                <span @dblclick.stop="handleNodeDoubleClick(data)">{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </div>
        <div class="tree-footer">
          <el-button size="small" @click="toggleShowDisabled">
            {{ showDisabled ? '隐藏禁用部门' : '显示禁用部门' }}
          </el-button>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="main-panel">
        <!-- 搜索表单 -->
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="账号:">
              <el-input v-model="searchForm.username" placeholder="请输入账号" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="手机号:">
              <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="角色:">
              <el-select v-model="searchForm.roleId" placeholder="请选择角色" clearable style="width: 180px">
                <el-option
                  v-for="role in roleOptions"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态:">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 180px">
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
          <el-button type="primary" @click="handleAdd">添加用户</el-button>
          <el-button>清空</el-button>
        </div>

        <!-- 数据表格 -->
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="username" label="账号" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="deptName" label="部门" />
          <el-table-column prop="roleName" label="角色" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" />
          <el-table-column prop="lastActiveTime" label="最后活跃时间" width="160" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="primary" @click="handleView(row)">查看</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增市级局对话框 -->
    <el-dialog
      v-model="showAddCompanyDialog"
      title="新增市级局（公司）"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="companyFormRef"
        :model="companyForm"
        :rules="companyFormRules"
        label-width="100px"
      >
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="companyForm.deptName"
            placeholder="请输入部门名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="companyForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="companyForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCompanyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCompany" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增部门对话框 -->
    <el-dialog
      v-model="showAddDeptDialog"
      title="新增部门（处室）"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="deptFormRef"
        :model="deptForm"
        :rules="deptFormRules"
        label-width="100px"
      >
        <el-form-item label="上级部门">
          <el-input :value="selectedNode?.deptName" disabled />
        </el-form-item>
        <el-form-item label="部门层级">
          <el-input :value="deptForm.deptLevel" disabled />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="deptForm.deptName"
            placeholder="请输入部门名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="deptForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="deptForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDeptDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitDept" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑部门对话框 -->
    <el-dialog
      v-model="showEditDeptDialog"
      title="编辑部门"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editDeptFormRef"
        :model="editDeptForm"
        :rules="editDeptFormRules"
        label-width="100px"
      >
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="editDeptForm.deptName"
            placeholder="请输入部门名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editDeptForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDeptDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitEditDept" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="showAddUserDialog"
      :title="isEditMode ? '编辑用户' : '新增用户'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="userForm.password"
            type="password"
            :placeholder="isEditMode ? '不修改请留空' : '请输入密码'"
            clearable
            show-password
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="userForm.phone"
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-input
            v-model="userForm.deptName"
            placeholder="部门"
            disabled
          />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="userForm.roleIds"
            placeholder="请选择角色"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddUserDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitUser" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看用户对话框 -->
    <el-dialog
      v-model="showViewUserDialog"
      title="查看用户"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{ viewUserData.username }}</el-descriptions-item>
        <el-descriptions-item label="密码">*******</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ viewUserData.phone }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ viewUserData.deptName }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ viewUserData.roleName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="viewUserData.status === 1 ? 'success' : 'info'">
            {{ viewUserData.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showViewUserDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      class="context-menu"
    >
      <div class="menu-item" @click="handleContextAddChild">新增下级部门</div>
      <div class="menu-item" @click="handleContextEdit">编辑</div>
      <div class="menu-item" @click="handleContextToggleStatus">
        {{ rightClickNode?.status === 1 ? '禁用' : '启用' }}
      </div>
      <div class="menu-item menu-item-danger" @click="handleContextDelete">删除</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, OfficeBuilding } from '@element-plus/icons-vue'
import { getDeptTreeAPI, addTopDeptAPI, addChildDeptAPI, updateDeptAPI, deleteDeptAPI, searchDeptTreeAPI, getDeptUserListAPI, addDeptUserAPI, updateDeptUserAPI, getDeptUserDetailAPI, getRoleDropdownListAPI, deleteDeptUserAPI } from '@/api'
import md5 from 'js-md5'

// 树形数据
const treeSearchText = ref('')
const treeRef = ref(null)
const treeData = ref([])
const showDisabled = ref(false)

const treeProps = {
  children: 'children',
  label: 'deptName'
}

// 加载部门树数据
const loadDeptTree = async () => {
  try {
    const res = await getDeptTreeAPI({
      showEnable: showDisabled.value ? 1 : 0
    })
    if (res.code === 1) {
      treeData.value = res.data || []
    } else {
      ElMessage.error(res.msg || '获取部门树失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

// 搜索部门树
const searchDeptTree = async (searchName) => {
  if (!searchName || searchName.trim() === '') {
    loadDeptTree()
    return
  }

  try {
    const res = await searchDeptTreeAPI(searchName.trim())
    if (res.code === 1) {
      treeData.value = res.data || []
      if (res.data.length === 0) {
        ElMessage.info('未找到匹配部门')
      }
    } else {
      ElMessage.error(res.msg || '搜索失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

// 切换显示/隐藏禁用部门
const toggleShowDisabled = () => {
  showDisabled.value = !showDisabled.value
  loadDeptTree()
}

// 页面加载时获取数据
onMounted(() => {
  loadDeptTree()
  loadRoleOptions()
})

// 监听搜索框变化
watch(treeSearchText, (val) => {
  searchDeptTree(val)
})

// 树节点点击
const selectedNode = ref(null)

const handleNodeClick = (data) => {
  console.log('选中节点:', data)
  selectedNode.value = data
}

const handleNodeDoubleClick = (data) => {
  console.log('双击节点:', data)
  selectedNode.value = data
  loadTableData()
}

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const rightClickNode = ref(null)

const handleNodeRightClick = (event, data) => {
  event.preventDefault()
  rightClickNode.value = data
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true

  // 点击其他地方关闭菜单
  document.addEventListener('click', closeContextMenu)
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
  document.removeEventListener('click', closeContextMenu)
}

const handleContextAddChild = () => {
  if (rightClickNode.value.deptLevel >= 3) {
    ElMessage.warning('三级部门不能新增下级部门')
    return
  }

  selectedNode.value = rightClickNode.value
  showAddDeptDialog.value = true
  deptForm.value = {
    parentDeptId: rightClickNode.value.deptId,
    deptName: '',
    deptLevel: rightClickNode.value.deptLevel + 1,
    status: 1,
    remark: ''
  }
  deptFormRef.value?.clearValidate()
}

const handleContextEdit = () => {
  showEditDeptDialog.value = true
  editDeptForm.value = {
    deptId: rightClickNode.value.deptId,
    deptName: rightClickNode.value.deptName,
    status: rightClickNode.value.status
  }
  editDeptFormRef.value?.clearValidate()
}

const handleContextToggleStatus = async () => {
  const newStatus = rightClickNode.value.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(`确定${statusText}部门"${rightClickNode.value.deptName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await updateDeptAPI({
      deptId: rightClickNode.value.deptId,
      deptName: rightClickNode.value.deptName,
      status: newStatus
    })

    if (res.code === 1) {
      ElMessage.success(`${statusText}成功`)
      loadDeptTree()
    } else {
      ElMessage.error(res.msg || `${statusText}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${statusText}部门失败:`, error)
      ElMessage.error(`${statusText}失败，请重试`)
    }
  }
}

const handleContextDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定删除部门"${rightClickNode.value.deptName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteDeptAPI(rightClickNode.value.deptId)

    if (res.code === 1) {
      ElMessage.success('删除部门成功')
      loadDeptTree()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除部门失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 新增市级局（公司）
const showAddCompanyDialog = ref(false)
const companyFormRef = ref(null)
const submitting = ref(false)

const companyForm = ref({
  deptName: '',
  status: 1,
  remark: ''
})

const companyFormRules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const handleAddCompany = () => {
  showAddCompanyDialog.value = true
  companyForm.value = {
    deptName: '',
    status: 1,
    remark: ''
  }
  companyFormRef.value?.clearValidate()
}

const handleSubmitCompany = async () => {
  try {
    await companyFormRef.value?.validate()

    submitting.value = true

    const res = await addTopDeptAPI({
      deptName: companyForm.value.deptName,
      deptLevel: 1,
      status: companyForm.value.status,
      remark: companyForm.value.remark
    })

    if (res.code === 1) {
      ElMessage.success('新增顶级部门成功')
      showAddCompanyDialog.value = false
      loadDeptTree()
    } else {
      ElMessage.error(res.msg || '新增失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('新增失败:', error)
      ElMessage.error('请完善必填项或检查网络连接')
    }
  } finally {
    submitting.value = false
  }
}

// 新增部门（处室）
const showAddDeptDialog = ref(false)
const deptFormRef = ref(null)

const deptForm = ref({
  parentDeptId: null,
  deptName: '',
  deptLevel: 2,
  status: 1,
  remark: ''
})

const deptFormRules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 编辑部门
const showEditDeptDialog = ref(false)
const editDeptFormRef = ref(null)

const editDeptForm = ref({
  deptId: null,
  deptName: '',
  status: 1
})

const editDeptFormRules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const handleAddDepartment = () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择上级部门')
    return
  }

  if (selectedNode.value.deptLevel >= 3) {
    ElMessage.warning('三级部门不能新增下级部门')
    return
  }

  showAddDeptDialog.value = true
  deptForm.value = {
    parentDeptId: selectedNode.value.deptId,
    deptName: '',
    deptLevel: selectedNode.value.deptLevel + 1,
    status: 1,
    remark: ''
  }
  deptFormRef.value?.clearValidate()
}

const handleSubmitDept = async () => {
  try {
    await deptFormRef.value?.validate()

    submitting.value = true

    const res = await addChildDeptAPI({
      parentDeptId: deptForm.value.parentDeptId,
      deptName: deptForm.value.deptName,
      deptLevel: deptForm.value.deptLevel,
      status: deptForm.value.status,
      remark: deptForm.value.remark
    })

    if (res.code === 1) {
      ElMessage.success('新增下级部门成功')
      showAddDeptDialog.value = false
      loadDeptTree()
    } else {
      ElMessage.error(res.msg || '新增失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('新增失败:', error)
      ElMessage.error('请完善必填项或检查网络连接')
    }
  } finally {
    submitting.value = false
  }
}

const handleSubmitEditDept = async () => {
  try {
    await editDeptFormRef.value?.validate()

    submitting.value = true

    const res = await updateDeptAPI({
      deptId: editDeptForm.value.deptId,
      deptName: editDeptForm.value.deptName,
      status: editDeptForm.value.status
    })

    if (res.code === 1) {
      ElMessage.success('编辑部门成功')
      showEditDeptDialog.value = false
      loadDeptTree()
    } else {
      ElMessage.error(res.msg || '编辑失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('编辑失败:', error)
      ElMessage.error('请完善必填项或检查网络连接')
    }
  } finally {
    submitting.value = false
  }
}

// 搜索表单
const searchForm = ref({
  username: '',
  phone: '',
  roleId: '',
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
    username: '',
    phone: '',
    roleId: '',
    status: ''
  }
  pagination.value.page = 1
  loadTableData()
}

// 加载表格数据
const loadTableData = async () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先双击选择部门')
    return
  }

  try {
    const res = await getDeptUserListAPI({
      pageNum: pagination.value.page,
      pageSize: pagination.value.pageSize,
      deptId: selectedNode.value.deptId,
      username: searchForm.value.username,
      phone: searchForm.value.phone,
      roleId: searchForm.value.roleId,
      status: searchForm.value.status
    })

    if (res.code === 1) {
      tableData.value = res.data.list || []
      pagination.value.total = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取用户列表失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

// 添加用户
const showAddUserDialog = ref(false)
const userFormRef = ref(null)
const roleOptions = ref([])
const isEditMode = ref(false)

// 查看用户
const showViewUserDialog = ref(false)
const viewUserData = ref({
  username: '',
  phone: '',
  deptName: '',
  roleName: '',
  status: 1
})

const userForm = ref({
  userId: null,
  username: '',
  password: '',
  phone: '',
  deptId: null,
  deptName: '',
  roleIds: '',
  status: 1
})

const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (!isEditMode.value && !value) {
          callback(new Error('请输入密码'))
        } else if (value && value.length < 6) {
          callback(new Error('密码长度不能少于6位'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  deptId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  roleIds: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 加载角色下拉列表
const loadRoleOptions = async () => {
  try {
    const res = await getRoleDropdownListAPI()
    if (res.code === 1) {
      roleOptions.value = res.data || []
    } else {
      ElMessage.error(res.msg || '获取角色列表失败')
    }
  } catch (err) {
    console.error('获取角色列表失败:', err)
  }
}

const handleAdd = async () => {
  if (!selectedNode.value) {
    ElMessage.warning('请先选择部门')
    return
  }

  isEditMode.value = false
  await loadRoleOptions()
  showAddUserDialog.value = true
  userForm.value = {
    userId: null,
    username: '',
    password: '',
    phone: '',
    deptId: selectedNode.value.deptId,
    deptName: selectedNode.value.deptName,
    roleIds: '',
    status: 1
  }
  userFormRef.value?.clearValidate()
}

const handleSubmitUser = async () => {
  try {
    await userFormRef.value?.validate()

    submitting.value = true

    if (isEditMode.value) {
      // 编辑用户
      const updateData = {
        userId: userForm.value.userId,
        username: userForm.value.username,
        phone: userForm.value.phone,
        deptId: userForm.value.deptId,
        status: userForm.value.status,
        roleIds: [userForm.value.roleIds]
      }

      // 如果填写了密码，则更新密码
      if (userForm.value.password) {
        updateData.password = md5(userForm.value.password)
      }

      const res = await updateDeptUserAPI(updateData)

      if (res.code === 1) {
        ElMessage.success('修改用户成功')
        showAddUserDialog.value = false
        loadTableData()
      } else {
        ElMessage.error(res.msg || '修改失败')
      }
    } else {
      // 新增用户
      const res = await addDeptUserAPI({
        username: userForm.value.username,
        password: md5(userForm.value.password),
        phone: userForm.value.phone,
        deptId: userForm.value.deptId,
        status: userForm.value.status,
        roleIds: [userForm.value.roleIds]
      })

      if (res.code === 1) {
        ElMessage.success('新增用户成功')
        showAddUserDialog.value = false
        loadTableData()
      } else {
        ElMessage.error(res.msg || '新增失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('新增用户失败:', error)
      ElMessage.error('请完善必填项或检查网络连接')
    }
  } finally {
    submitting.value = false
  }
}

// 编辑
const handleEdit = async (row) => {
  isEditMode.value = true
  await loadRoleOptions()

  // 如果有 roleId 直接使用，否则通过 roleName 查找
  let roleId = row.roleId
  if (!roleId && row.roleName) {
    const role = roleOptions.value.find(r => r.name === row.roleName)
    roleId = role?.id
  }

  showAddUserDialog.value = true

  // 使用 nextTick 确保对话框打开后再设置表单值
  await new Promise(resolve => setTimeout(resolve, 0))

  userForm.value = {
    userId: row.userId,
    username: row.username,
    password: '',
    phone: row.phone,
    deptId: row.deptId,
    deptName: row.deptName,
    roleIds: roleId,
    status: row.status
  }
  userFormRef.value?.clearValidate()
}

// 查看
const handleView = async (row) => {
  try {
    const res = await getDeptUserDetailAPI(row.userId)
    if (res.code === 1) {
      viewUserData.value = {
        username: res.data.username || '',
        phone: res.data.phone || '',
        deptName: res.data.deptName || '',
        roleName: res.data.roleName || '',
        status: res.data.status
      }
      showViewUserDialog.value = true
    } else {
      ElMessage.error(res.msg || '获取用户详情失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除用户 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteDeptUserAPI(row.userId)
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
.organization-container {
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

.content-layout {
  display: flex;
  gap: 16px;
}

.tree-panel {
  width: 280px;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: calc(100vh - 150px);
}

.tree-search {
  margin-bottom: 16px;
}

.tree-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tree-actions .el-button {
  flex: 1;
  font-size: 12px;
  padding: 8px 4px;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
}

.tree-footer {
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.tree-footer .el-button {
  width: 100%;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  cursor: pointer;
}

.tree-node-disabled {
  color: #c0c4cc;
  opacity: 0.6;
}

.main-panel {
  flex: 1;
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

.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  padding: 4px 0;
  min-width: 120px;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: all 0.2s;
}

.menu-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.menu-item-danger {
  color: #f56c6c;
}

.menu-item-danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}
</style>
