<template>
  <div class="warning-config">
    <div class="config-header">
      <h2>预警专题配置</h2>
      <el-button type="primary" @click="handleAdd">新增预警</el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input v-model="filterKeyword" placeholder="请输入专题名称或预警词" style="width: 300px;">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filterStatus" placeholder="状态" style="width: 150px;">
        <el-option label="全部" value="" />
        <el-option label="启用" value="enabled" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" @click="handleFilter">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
      <el-button type="danger" @click="handleBatchDelete">删除</el-button>
    </div>

    <!-- 配置列表 -->
    <div class="config-table">
      <el-table :data="configList" stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="topicName" label="预警专题" min-width="120" />
        <el-table-column prop="keywords" label="预警词" min-width="150">
          <template #default="scope">
            <el-tag v-for="(keyword, index) in scope.row.keywords" :key="index" size="small" style="margin-right: 5px;">
              {{ keyword }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="预警等级" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="预警来源" width="120" />
        <el-table-column prop="frequency" label="预警频率" width="120" />
        <el-table-column prop="warningTime" label="预警时间" width="100" />
        <el-table-column prop="notifyMethod" label="通知方式" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="updateTime" label="操作时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="预警专题">
          <el-input v-model="formData.topicName" placeholder="请输入预警专题名称" />
        </el-form-item>
        <el-form-item label="预警词">
          <el-input v-model="formData.keywordsInput" placeholder="多个关键词用逗号分隔" />
        </el-form-item>
        <el-form-item label="预警等级">
          <el-select v-model="formData.level" placeholder="请选择预警等级">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警来源">
          <el-select v-model="formData.source" placeholder="请选择预警来源">
            <el-option label="全部" value="全部" />
            <el-option label="微博" value="微博" />
            <el-option label="微信" value="微信" />
            <el-option label="网媒" value="网媒" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警频率">
          <el-select v-model="formData.frequency" placeholder="请选择预警频率">
            <el-option label="实时" value="实时" />
            <el-option label="每小时" value="每小时" />
            <el-option label="每天" value="每天" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警时间">
          <el-input v-model="formData.warningTime" placeholder="如：全天、9:00-18:00" />
        </el-form-item>
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="formData.notifyMethods">
            <el-checkbox label="邮件" />
            <el-checkbox label="短信" />
            <el-checkbox label="系统通知" />
          </el-checkbox-group>
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

const filterKeyword = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const selectedRows = ref([])

const showDialog = ref(false)
const dialogTitle = ref('新增预警')
const formData = ref({
  topicName: '',
  keywordsInput: '',
  level: '',
  source: '',
  frequency: '',
  warningTime: '',
  notifyMethods: []
})


// 模拟数据
const configList = ref([
  {
    id: 1,
    topicName: '非法文章',
    keywords: ['走私', '贩毒', '非法'],
    level: '高',
    source: '全部',
    frequency: '实时',
    warningTime: '全天',
    notifyMethod: '邮件、短信',
    status: 'enabled',
    operator: '管理员',
    updateTime: '2024-01-15 14:30:25'
  },
  {
    id: 2,
    topicName: '假冒伪劣',
    keywords: ['假货', '伪劣', '仿冒'],
    level: '中',
    source: '微博',
    frequency: '每小时',
    warningTime: '9:00-18:00',
    notifyMethod: '系统通知',
    status: 'enabled',
    operator: '张三',
    updateTime: '2024-01-15 13:20:18'
  },
  {
    id: 3,
    topicName: '走私',
    keywords: ['走私', '偷渡'],
    level: '高',
    source: '网媒',
    frequency: '实时',
    warningTime: '全天',
    notifyMethod: '邮件、短信、系统通知',
    status: 'disabled',
    operator: '李四',
    updateTime: '2024-01-14 16:45:30'
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

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  dialogTitle.value = '新增预警'
  formData.value = {
    topicName: '',
    keywordsInput: '',
    level: '',
    source: '',
    frequency: '',
    warningTime: '',
    notifyMethods: []
  }
  showDialog.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑预警'
  formData.value = {
    topicName: row.topicName,
    keywordsInput: row.keywords.join(','),
    level: row.level,
    source: row.source,
    frequency: row.frequency,
    warningTime: row.warningTime,
    notifyMethods: row.notifyMethod.split('、')
  }
  showDialog.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条预警配置吗？', '提示', {
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

const handleStatusChange = (row) => {
  const status = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`已${status}`)
}

const handleFilter = () => {
  console.log('筛选:', filterKeyword.value, filterStatus.value)
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterKeyword.value = ''
  filterStatus.value = ''
}

const handleSubmit = () => {
  if (!formData.value.topicName) {
    ElMessage.warning('请输入预警专题名称')
    return
  }
  ElMessage.success('保存成功')
  showDialog.value = false
}
</script>

<style scoped>
.warning-config {
  padding: 20px;
  background: #fff;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.config-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.config-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
