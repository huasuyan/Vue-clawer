<template>
  <div class="report-setting">
    <div class="header">
      <div class="header-left">
        <h2>舆情报告设置</h2>
        <span class="count-badge">运行中{{ runningCount }}个</span>
      </div>
      <div class="header-right">
        <el-input 
          v-model="searchKeyword" 
          placeholder="请输入关键字" 
          class="search-input"
          clearable
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleClear">清空</el-button>
      </div>
    </div>

    <div class="card-grid">
      <!-- 新增卡片 -->
      <div class="add-card" @click="showAddDialog = true">
        <el-icon class="add-icon"><Plus /></el-icon>
        <div class="add-text">新增监控报告</div>
      </div>

      <!-- 报告卡片列表 -->
      <div 
        v-for="item in reportList" 
        :key="item.id" 
        class="report-card"
      >
        <div class="card-header">
          <div class="card-title">
            <el-icon class="title-icon"><Document /></el-icon>
            <span>{{ item.title }}</span>
          </div>
          <div class="tags">
            <el-tag 
              v-if="item.frequency" 
              :type="item.frequency === '周定时' ? 'primary' : 'success'"
              size="small"
            >
              {{ item.frequency }}
            </el-tag>
            <el-tag
              v-if="item.status"
              :type="item.status === '运行中' ? 'success' : item.status === '已暂停' ? 'warning' : 'info'"
              size="small"
            >
              {{ item.status }}
            </el-tag>
          </div>
        </div>

        <div class="card-content">
          <div class="info-row">
            <span class="label">监测内容</span>
            <span class="value">{{ item.regions }}</span>
          </div>
          <div class="info-row">
            <span class="label">监测时段</span>
            <span class="value">{{ item.startTime }}至{{ item.endTime }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间</span>
            <span class="value">{{ item.createTime }}</span>
          </div>
        </div>

        <div class="card-footer">
          <el-button text type="primary" @click="handleEdit(item)">编辑</el-button>
          <el-button text type="danger" @click="handleDelete(item)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog 
      v-model="showAddDialog" 
      :title="editingItem ? '编辑监控报告' : '新增监控报告'"
      width="500px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="报告标题">
          <el-input v-model="formData.title" placeholder="请输入报告标题" />
        </el-form-item>
        <el-form-item label="监测内容">
          <el-input v-model="formData.regions" placeholder="请输入监测地区，如：上海 石家庄 青岛" />
        </el-form-item>
        <el-form-item label="监测时段">
          <el-date-picker
            v-model="formData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="报告频率">
          <el-select v-model="formData.frequency" placeholder="请选择报告频率">
            <el-option label="日定时" value="日定时" />
            <el-option label="周定时" value="周定时" />
            <el-option label="月定时" value="月定时" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="运行中" value="运行中" />
            <el-option label="已暂停" value="已暂停" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const showAddDialog = ref(false)
const editingItem = ref(null)

const formData = ref({
  title: '',
  regions: '',
  dateRange: [],
  frequency: '',
  status: '运行中'
})

// 模拟报告数据
const reportList = ref([
  {
    id: 1,
    title: '淮东舆情周办件',
    regions: '上海 石家庄 青岛',
    startTime: '2024-04-01',
    endTime: '2024-06-01',
    createTime: '2024-04-01 10:00',
    frequency: '周定时',
    status: '运行中'
  },
  {
    id: 2,
    title: '淮东舆情周办件',
    regions: '上海 石家庄 青岛',
    startTime: '2024-04-01',
    endTime: '2024-06-01',
    createTime: '2024-04-01 10:00',
    frequency: '周定时',
    status: '运行中'
  },
  {
    id: 3,
    title: '淮东舆情周办件',
    regions: '上海 石家庄 青岛',
    startTime: '2024-04-01',
    endTime: '2024-06-01',
    createTime: '2024-04-01 10:00',
    frequency: '日定时',
    status: '已暂停'
  },
  {
    id: 4,
    title: '淮东舆情周办件',
    regions: '上海 石家庄 青岛',
    startTime: '2024-04-01',
    endTime: '2024-06-01',
    createTime: '2024-04-01 10:00',
    frequency: '月定时',
    status: '已结束'
  }
])

const runningCount = computed(() => {
  return reportList.value.filter(item => item.status === '运行中').length
})

const handleSearch = () => {
  ElMessage.info('搜索功能开发中')
}

const handleClear = () => {
  searchKeyword.value = ''
  ElMessage.success('已清空搜索条件')
}

const handleEdit = (item) => {
  editingItem.value = item
  formData.value = {
    title: item.title,
    regions: item.regions,
    dateRange: [item.startTime, item.endTime],
    frequency: item.frequency,
    status: item.status
  }
  showAddDialog.value = true
}

const handleDelete = (item) => {
  ElMessageBox.confirm('确定要删除该监控报告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = reportList.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      reportList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = () => {
  if (!formData.value.title) {
    ElMessage.warning('请输入报告标题')
    return
  }

  if (editingItem.value) {
    // 编辑
    Object.assign(editingItem.value, {
      title: formData.value.title,
      regions: formData.value.regions,
      startTime: formData.value.dateRange[0],
      endTime: formData.value.dateRange[1],
      frequency: formData.value.frequency,
      status: formData.value.status
    })
    ElMessage.success('编辑成功')
  } else {
    // 新增
    reportList.value.push({
      id: Date.now(),
      title: formData.value.title,
      regions: formData.value.regions,
      startTime: formData.value.dateRange[0],
      endTime: formData.value.dateRange[1],
      createTime: new Date().toLocaleString('zh-CN'),
      frequency: formData.value.frequency,
      status: formData.value.status
    })
    ElMessage.success('新增成功')
  }

  showAddDialog.value = false
  editingItem.value = null
  formData.value = {
    title: '',
    regions: '',
    dateRange: [],
    frequency: '',
    status: '运行中'
  }
}
</script>

<style scoped>
.report-setting {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.count-badge {
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px;
  font-size: 13px;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 240px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  overflow-y: auto;
  flex: 1;
}

.add-card {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.add-card:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.add-icon {
  font-size: 32px;
  color: #999;
  margin-bottom: 6px;
}

.add-card:hover .add-icon {
  color: #667eea;
}

.add-text {
  font-size: 13px;
  color: #666;
}

.add-card:hover .add-text {
  color: #667eea;
}

.report-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s;
  background: #fff;
  height: 200px;
}

.report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  flex: 1;
  overflow: hidden;
}

.card-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-icon {
  font-size: 14px;
  color: #667eea;
  flex-shrink: 0;
}

.tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11px;
  line-height: 1.4;
}

.info-row .label {
  color: #999;
  min-width: 56px;
  flex-shrink: 0;
}

.info-row .value {
  color: #666;
  flex: 1;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
</style>