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
        <el-tree
          :data="treeData"
          :props="treeProps"
          :filter-node-method="filterNode"
          ref="treeRef"
          node-key="id"
          default-expand-all
          highlight-current
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <el-icon><OfficeBuilding /></el-icon>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧内容区 -->
      <div class="main-panel">
        <!-- 搜索表单 -->
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="账号:">
              <el-input v-model="searchForm.account" placeholder="请输入" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="姓名:">
              <el-input v-model="searchForm.name" placeholder="请输入" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="用品:">
              <el-input v-model="searchForm.supplies" placeholder="请输入" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="状态:">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 180px">
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="岗位:">
              <el-input v-model="searchForm.position" placeholder="请输入" clearable style="width: 180px" />
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
          <el-table-column prop="account" label="账号" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="position" label="岗位" />
          <el-table-column prop="role" label="角色" />
          <el-table-column prop="status" label="状态" />
          <el-table-column prop="operator" label="操作人" />
          <el-table-column prop="operateTime" label="操作时间" width="160" />
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, OfficeBuilding } from '@element-plus/icons-vue'
import { getDeptTreeAPI } from '@/api'

// 树形数据
const treeSearchText = ref('')
const treeRef = ref(null)
const treeData = ref([])

const treeProps = {
  children: 'children',
  label: 'label'
}

// 加载部门树数据
const loadDeptTree = async () => {
  try {
    const res = await getDeptTreeAPI()
    if (res.code === 1) {
      treeData.value = res.data
    } else {
      ElMessage.error(res.msg || '获取部门树失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，请重试')
    console.error(err)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadDeptTree()
})

// 树节点过滤
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

watch(treeSearchText, (val) => {
  treeRef.value?.filter(val)
})

// 树节点点击
const handleNodeClick = (data) => {
  console.log('选中节点:', data)
  loadTableData()
}

// 新增市级局（公司）
const handleAddCompany = () => {
  ElMessage.info('打开新增市级局（公司）对话框')
}

// 新增部门（处室）
const handleAddDepartment = () => {
  ElMessage.info('打开新增部门（处室）对话框')
}

// 搜索表单
const searchForm = ref({
  account: '',
  name: '',
  supplies: '',
  status: '',
  position: ''
})

// 表格数据
const tableData = ref([
  { account: 'zhangsan', name: '张三', position: '经理', role: '管理员', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan1', name: '张三1', position: '职员', role: '普通用户', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan2', name: '张三2', position: '职员', role: '普通用户', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan3', name: '张三3', position: '职员', role: '普通用户', status: '禁用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan4', name: '张三4', position: '主管', role: '管理员', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan5', name: '张三5', position: '职员', role: '普通用户', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan6', name: '张三6', position: '职员', role: '普通用户', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan7', name: '张三7', position: '职员', role: '普通用户', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan8', name: '张三8', position: '职员', role: '普通用户', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' },
  { account: 'zhangsan9', name: '张三9', position: '职员', role: '普通用户', status: '启用', operator: 'admin', operateTime: '2023-11-11 10:00:00' }
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
    supplies: '',
    status: '',
    position: ''
  }
  loadTableData()
}

// 加载表格数据
const loadTableData = () => {
  // TODO: 调用API获取数据
  console.log('加载数据', searchForm.value, pagination.value)
}

// 添加用户
const handleAdd = () => {
  ElMessage.info('打开添加用户对话框')
}

// 编辑
const handleEdit = (row) => {
  ElMessage.info(`编辑用户: ${row.name}`)
}

// 查看
const handleView = (row) => {
  ElMessage.info(`查看用户: ${row.name}`)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除用户 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadTableData()
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
  height: fit-content;
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

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
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
</style>
