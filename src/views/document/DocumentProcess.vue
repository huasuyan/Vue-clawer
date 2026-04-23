<template>
  <div class="document-process">
    <!-- 状态标签页 -->
    <div class="status-tabs">
      <div 
        v-for="tab in statusTabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="changeTab(tab.key)"
      >
        {{ tab.label }}({{ tab.count }})
      </div>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <el-form :model="filterForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="办件名称:">
              <el-input v-model="filterForm.name" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="现察管区:">
              <el-select v-model="filterForm.district" placeholder="请选择" clearable style="width: 100%">
                <el-option label="东区" value="东区" />
                <el-option label="西区" value="西区" />
                <el-option label="南区" value="南区" />
                <el-option label="北区" value="北区" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="办件类型:">
              <el-select v-model="filterForm.type" placeholder="请选择" clearable style="width: 100%">
                <el-option label="类型A" value="A" />
                <el-option label="类型B" value="B" />
                <el-option label="类型C" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="涉案人员:">
              <el-input v-model="filterForm.person" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="涉案金额:">
              <div style="display: flex; gap: 8px; align-items: center;">
                <el-input v-model="filterForm.amountMin" placeholder="请输入" clearable />
                <span>至</span>
                <el-input v-model="filterForm.amountMax" placeholder="请输入" clearable />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="办理作:">
              <el-select v-model="filterForm.handler" placeholder="请选择" clearable style="width: 100%">
                <el-option label="处理人A" value="A" />
                <el-option label="处理人B" value="B" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="创建人:">
              <el-input v-model="filterForm.creator" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="办件编号:">
              <el-input v-model="filterForm.code" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间:">
              <div style="display: flex; gap: 8px; align-items: center;">
                <el-date-picker 
                  v-model="filterForm.createTimeStart" 
                  type="date" 
                  placeholder="开始日期"
                  style="flex: 1"
                />
                <span>至</span>
                <el-date-picker 
                  v-model="filterForm.createTimeEnd" 
                  type="date" 
                  placeholder="结束日期"
                  style="flex: 1"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接收时间:">
              <div style="display: flex; gap: 8px; align-items: center;">
                <el-date-picker 
                  v-model="filterForm.receiveTimeStart" 
                  type="date" 
                  placeholder="开始日期"
                  style="flex: 1"
                />
                <span>至</span>
                <el-date-picker 
                  v-model="filterForm.receiveTimeEnd" 
                  type="date" 
                  placeholder="结束日期"
                  style="flex: 1"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" style="text-align: right;">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">清空</el-button>
            <el-button link @click="toggleExpand">
              {{ isExpanded ? '收起' : '展开' }}
              <el-icon><ArrowUp v-if="isExpanded" /><ArrowDown v-else /></el-icon>
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">新增办件</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="code" label="办件编号" min-width="140" />
      <el-table-column prop="name" label="办件名称" min-width="150" />
      <el-table-column prop="district" label="现察管区" min-width="100" />
      <el-table-column prop="type" label="办件类型" min-width="100" />
      <el-table-column prop="person" label="涉案人员" min-width="100" />
      <el-table-column prop="amount" label="涉案金额(万元)" min-width="130" />
      <el-table-column prop="stage" label="办理环节" min-width="100" />
      <el-table-column prop="creator" label="创建人" min-width="100" />
      <el-table-column prop="createTime" label="创建时间" min-width="160" />
      <el-table-column prop="flowTime" label="流动时间" min-width="160" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('pending')
const isExpanded = ref(true)

const statusTabs = ref([
  { key: 'pending', label: '待办', count: 1 },
  { key: 'processing', label: '办理中', count: 19 },
  { key: 'waitingPolice', label: '待公安反馈', count: 2 },
  { key: 'waitingPromise', label: '待许诺', count: 0 },
  { key: 'archived', label: '已归档', count: 8 },
  { key: 'closed', label: '已关闭', count: 34 },
  { key: 'abnormal', label: '异常', count: 1 }
])

const filterForm = reactive({
  name: '',
  district: '',
  type: '',
  person: '',
  amountMin: '',
  amountMax: '',
  handler: '',
  creator: '',
  code: '',
  createTimeStart: '',
  createTimeEnd: '',
  receiveTimeStart: '',
  receiveTimeEnd: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref([
  {
    code: 'BJ202401001',
    name: '办件A',
    district: '东区',
    type: '类型A',
    person: '张三',
    amount: '50',
    stage: '初审',
    creator: '李四',
    createTime: '2024-01-15 10:30:00',
    flowTime: '2024-01-16 14:20:00'
  },
  {
    code: 'BJ202401002',
    name: '办件B',
    district: '西区',
    type: '类型B',
    person: '王五',
    amount: '120',
    stage: '复审',
    creator: '赵六',
    createTime: '2024-01-14 09:15:00',
    flowTime: '2024-01-15 16:45:00'
  }
])

const changeTab = (key) => {
  activeTab.value = key
  handleSearch()
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleSearch = () => {
  console.log('查询条件:', filterForm)
  ElMessage.success('查询成功')
  // TODO: 调用接口查询数据
}

const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  ElMessage.info('已清空筛选条件')
}

const handleCreate = () => {
  ElMessage.info('打开新增办件弹窗')
  // TODO: 打开新增弹窗
}

const handleDetail = (row) => {
  console.log('查看详情:', row)
  ElMessage.info(`查看办件 ${row.code} 详情`)
  // TODO: 跳转到详情页或打开详情弹窗
}

const handleSizeChange = (size) => {
  pagination.size = size
  handleSearch()
}

const handlePageChange = (page) => {
  pagination.page = page
  handleSearch()
}
</script>

<style scoped>
.document-process {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.status-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: #fff;
  padding: 15px;
  border-radius: 4px;
}

.tab-item {
  padding: 8px 20px;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #666;
}

.tab-item:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.tab-item.active {
  background: #1890ff;
  color: #fff;
}

.filter-form {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 15px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
