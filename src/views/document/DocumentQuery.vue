<template>
  <div class="document-query">
    <!-- 筛选表单 -->
    <div class="filter-form">
      <el-form :model="filterForm" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="办件名称:">
              <el-input v-model="filterForm.name" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="档案号码:">
              <el-input v-model="filterForm.archiveNo" placeholder="请输入" clearable />
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

        <el-row :gutter="20" v-show="isExpanded">
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
            <el-form-item label="办理环节:">
              <el-select v-model="filterForm.stage" placeholder="请选择" clearable style="width: 100%">
                <el-option label="初审" value="初审" />
                <el-option label="复审" value="复审" />
                <el-option label="终审" value="终审" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="办件性质:">
              <el-select v-model="filterForm.nature" placeholder="请选择" clearable style="width: 100%">
                <el-option label="性质A" value="A" />
                <el-option label="性质B" value="B" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="创建人:">
              <el-input v-model="filterForm.creator" placeholder="请输入" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-show="isExpanded">
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
            <el-button @click="handleReset">重置</el-button>
            <el-button link @click="toggleExpand">
              {{ isExpanded ? '收起' : '展开' }}
              <el-icon><ArrowUp v-if="isExpanded" /><ArrowDown v-else /></el-icon>
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="code" label="办件编号" min-width="150" />
      <el-table-column prop="name" label="办件名称" min-width="120" />
      <el-table-column prop="archiveNo" label="档案号码" min-width="100" />
      <el-table-column prop="type" label="办件类型" min-width="100" />
      <el-table-column prop="person" label="涉案人员" min-width="120" />
      <el-table-column prop="amount" label="涉案金额(万元)" min-width="130" />
      <el-table-column prop="stage" label="办理环节" min-width="100" />
      <el-table-column prop="currentHandler" label="当前办人" min-width="100" />
      <el-table-column prop="status" label="状态" min-width="80" />
      <el-table-column prop="creator" label="创建人" min-width="100" />
      <el-table-column prop="createTime" label="创建时间" min-width="160" />
      <el-table-column label="比对" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleCompare(row)">详情</el-button>
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

const isExpanded = ref(true)

const filterForm = reactive({
  name: '',
  archiveNo: '',
  type: '',
  person: '',
  amountMin: '',
  amountMax: '',
  stage: '',
  nature: '',
  creator: '',
  createTimeStart: '',
  createTimeEnd: '',
  receiveTimeStart: '',
  receiveTimeEnd: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 10
})

const tableData = ref([
  {
    code: 'H.ZJ3R75233557',
    name: '涉黄预防外作',
    archiveNo: 'DA20240101',
    type: '类型A',
    person: '张三、李四',
    amount: '50',
    stage: '初审',
    currentHandler: '王五',
    status: '办理中',
    creator: '赵六',
    createTime: '2024-01-15 10:30:00'
  },
  {
    code: 'H.ZJ3R75233558',
    name: '涉赌案件处理',
    archiveNo: 'DA20240102',
    type: '类型B',
    person: '孙七',
    amount: '120',
    stage: '复审',
    currentHandler: '周八',
    status: '待反馈',
    creator: '吴九',
    createTime: '2024-01-14 09:15:00'
  },
  {
    code: 'H.ZJ3R75233559',
    name: '网络诈骗调查',
    archiveNo: 'DA20240103',
    type: '类型C',
    person: '郑十',
    amount: '300',
    stage: '终审',
    currentHandler: '冯十一',
    status: '已归档',
    creator: '陈十二',
    createTime: '2024-01-13 14:20:00'
  },
  {
    code: 'H.ZJ3R75233560',
    name: '非法集资案',
    archiveNo: 'DA20240104',
    type: '类型A',
    person: '褚十三',
    amount: '500',
    stage: '初审',
    currentHandler: '卫十四',
    status: '办理中',
    creator: '蒋十五',
    createTime: '2024-01-12 11:45:00'
  },
  {
    code: 'H.ZJ3R75233561',
    name: '洗钱案件侦查',
    archiveNo: 'DA20240105',
    type: '类型B',
    person: '沈十六',
    amount: '800',
    stage: '复审',
    currentHandler: '韩十七',
    status: '待反馈',
    creator: '杨十八',
    createTime: '2024-01-11 16:30:00'
  }
])

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
  ElMessage.info('已重置筛选条件')
}

const handleCompare = (row) => {
  console.log('比对办件:', row)
  ElMessage.info(`比对办件 ${row.code}`)
  // TODO: 打开比对弹窗或跳转到比对页面
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
.document-query {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.filter-form {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
