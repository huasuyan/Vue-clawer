<template>
  <div class="report-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-item">
        <span class="label">报告名称:</span>
        <el-input v-model="searchForm.name" placeholder="请输入" clearable />
      </div>
      <div class="search-item">
        <span class="label">关键词:</span>
        <el-input v-model="searchForm.keyword" placeholder="请输入" clearable />
      </div>
      <div class="search-item">
        <span class="label">报告生成:</span>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </div>
      <div class="search-buttons">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button @click="handleBatchDownload">下载</el-button>
      <el-button @click="handleBatchDelete">删除</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="报告名称" min-width="200" />
      <el-table-column prop="keywords" label="监测关键词" min-width="200" />
      <el-table-column prop="createTime" label="生成时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button text type="primary" @click="handleView(row)">查看</el-button>
            <el-button text type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination  
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看报告对话框 -->
    <el-dialog
      v-model="showViewDialog"
      :title="currentReport.reportName || '报告详情'"
      width="90%"
      top="5vh"
      class="report-dialog"
    >
      <div class="report-content" v-loading="reportLoading">
        <div class="report-header">
          <div class="report-meta">
            <p><strong>监测关键词：</strong>{{ formatKeywords(currentReport.monitorKeywords) }}</p>
            <p><strong>报告类型：</strong>{{ currentReport.reportType === 1 ? '即时报告' : '定时报告' }}</p>
            <p><strong>生成时间：</strong>{{ currentReport.createTime }}</p>
          </div>
          <el-button type="primary" @click="handleDownloadReport">下载报告</el-button>
        </div>

        <div class="report-sections">
          <div class="section" v-if="currentReport.briefSummary">
            <h4>简报概述</h4>
            <div class="section-content">{{ currentReport.briefSummary }}</div>
          </div>

          <div class="section" v-if="currentReport.monitorSummary">
            <h4>舆情概述</h4>
            <div class="section-content">{{ currentReport.monitorSummary }}</div>
          </div>

          <div class="section" v-if="currentReport.opinionTrend">
            <h4>舆情发展趋势</h4>
            <div class="section-content">{{ currentReport.opinionTrend }}</div>
          </div>

          <div class="section" v-if="currentReport.sourceMediaAnalysis">
            <h4>来源媒体分析</h4>
            <div class="section-content">{{ currentReport.sourceMediaAnalysis }}</div>
          </div>

          <div class="section" v-if="currentReport.emotionAnalysis">
            <h4>倾向分析</h4>
            <div class="section-content">{{ currentReport.emotionAnalysis }}</div>
          </div>

          <div class="section" v-if="currentReport.regionDistribution">
            <h4>地域分布</h4>
            <div class="section-content">{{ currentReport.regionDistribution }}</div>
          </div>

          <div class="section" v-if="currentReport.hotAnalysisWords">
            <h4>热词分析</h4>
            <div class="section-content">{{ currentReport.hotAnalysisWords }}</div>
          </div>

          <div class="section" v-if="currentReport.hotInformation">
            <h4>热门信息</h4>
            <div class="section-content">{{ currentReport.hotInformation }}</div>
          </div>

          <div class="section" v-if="currentReport.disposalOpinions !== undefined">
            <div class="section-header">
              <h4>处置意见</h4>
              <el-button
                v-if="!editingDisposal"
                type="primary"
                size="small"
                @click="handleEditDisposal"
              >
                编辑
              </el-button>
              <div v-else class="edit-actions">
                <el-button type="primary" size="small" @click="handleSaveDisposal" :loading="savingDisposal">保存</el-button>
                <el-button size="small" @click="handleCancelEditDisposal">取消</el-button>
              </div>
            </div>
            <div class="section-content" v-if="!editingDisposal">{{ currentReport.disposalOpinions || '暂无处置意见' }}</div>
            <el-input
              v-else
              v-model="disposalOpinionsEdit"
              type="textarea"
              :rows="6"
              placeholder="请输入处置意见"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReportResultListAPI, getReportDetailAPI, editReportResultAPI, deleteReportResultAPI } from '@/api/index'

const searchForm = ref({
  name: '',
  keyword: '',
  dateRange: []
})

const tableData = ref([])
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showViewDialog = ref(false)
const currentReport = ref({})
const reportLoading = ref(false)
const editingDisposal = ref(false)
const disposalOpinionsEdit = ref('')
const savingDisposal = ref(false)

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'

  try {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (e) {
    console.error('格式化时间失败:', e)
    return time
  }
}

// 格式化关键词显示
const formatKeywords = (monitorKeywords) => {
  try {
    if (!monitorKeywords) return '-'

    let keywords = monitorKeywords
    if (typeof keywords === 'string') {
      keywords = JSON.parse(keywords)
    }

    // 如果是数组格式
    if (Array.isArray(keywords)) {
      return keywords.join('、')
    }

    // 如果是对象格式 {keywordGroups: [["关键词1"], ["关键词2"]]}
    if (keywords.keywordGroups && Array.isArray(keywords.keywordGroups)) {
      const allKeywords = keywords.keywordGroups.flat()
      return allKeywords.join('、')
    }

    return '-'
  } catch (e) {
    console.error('格式化关键词失败:', e)
    return '-'
  }
}

// 获取报告列表
const fetchReportList = async () => {
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    // 添加搜索条件
    if (searchForm.value.name) {
      params.reportName = searchForm.value.name
    }

    if (searchForm.value.keyword) {
      params.monitor_keywords = {
        keywordGroups: [[searchForm.value.keyword]]
      }
    }

    if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
      params.startDate = searchForm.value.dateRange[0]
      params.endDate = searchForm.value.dateRange[1]
    }

    const res = await getReportResultListAPI(params)

    if (res.code === 1 && res.data) {
      tableData.value = (res.data.resultList || []).map(item => ({
        id: item.reportId,
        name: item.reportName,
        keywords: formatKeywords(item.monitorKeywords),
        createTime: formatTime(item.createTime),
        content: item.content || '暂无内容',
        rawData: item
      }))
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询报告列表失败:', error)
    ElMessage.error('查询失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchReportList()
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    keyword: '',
    dateRange: []
  }
  currentPage.value = 1
  fetchReportList()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleBatchDownload = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要下载的报告')
    return
  }
  ElMessage.success(`已下载${selectedRows.value.length}个报告`)
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的报告')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个报告吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleView = async (row) => {
  try {
    reportLoading.value = true
    showViewDialog.value = true
    editingDisposal.value = false

    const res = await getReportDetailAPI(row.id)

    if (res.code === 1 && res.data && res.data.reportResult) {
      const report = res.data.reportResult
      currentReport.value = {
        reportId: report.reportId,
        reportName: report.reportName,
        monitorKeywords: report.monitorKeywords,
        reportType: report.reportType,
        createTime: formatTime(report.createTime),
        briefSummary: report.briefSummary || '',
        monitorSummary: report.monitorSummary || '',
        opinionTrend: report.opinionTrend || '',
        sourceMediaAnalysis: report.sourceMediaAnalysis || '',
        emotionAnalysis: report.emotionAnalysis || '',
        regionDistribution: report.regionDistribution || '',
        hotAnalysisWords: report.hotAnalysisWords || '',
        hotInformation: report.hotInformation || '',
        disposalOpinions: report.disposalOpinions || ''
      }
    } else {
      ElMessage.error(res.msg || '获取报告详情失败')
      showViewDialog.value = false
    }
  } catch (error) {
    console.error('获取报告详情失败:', error)
    ElMessage.error('获取报告详情失败')
    showViewDialog.value = false
  } finally {
    reportLoading.value = false
  }
}

const handleDownloadReport = () => {
  ElMessage.success(`正在下载：${currentReport.value.reportName}`)
}

// 编辑处置意见
const handleEditDisposal = () => {
  disposalOpinionsEdit.value = currentReport.value.disposalOpinions
  editingDisposal.value = true
}

// 取消编辑处置意见
const handleCancelEditDisposal = () => {
  editingDisposal.value = false
  disposalOpinionsEdit.value = ''
}

// 保存处置意见
const handleSaveDisposal = async () => {
  try {
    savingDisposal.value = true

    const params = {
      reportId: currentReport.value.reportId,
      reportName: currentReport.value.reportName,
      briefSummary: currentReport.value.briefSummary,
      monitorSummary: currentReport.value.monitorSummary,
      opinionTrend: currentReport.value.opinionTrend,
      sourceMediaAnalysis: currentReport.value.sourceMediaAnalysis,
      emotionAnalysis: currentReport.value.emotionAnalysis,
      regionDistribution: currentReport.value.regionDistribution,
      hotAnalysisWords: currentReport.value.hotAnalysisWords,
      hotInformation: currentReport.value.hotInformation,
      disposalOpinions: disposalOpinionsEdit.value
    }

    const res = await editReportResultAPI(params)

    if (res.code === 1) {
      ElMessage.success('保存成功')
      currentReport.value.disposalOpinions = disposalOpinionsEdit.value
      editingDisposal.value = false
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    savingDisposal.value = false
  }
}

const handleDownload = (row) => {
  ElMessage.success(`正在下载：${row.name}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该报告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteReportResultAPI(row.id)

    if (res.code === 1) {
      ElMessage.success('删除成功')
      fetchReportList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchReportList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchReportList()
}

// 页面加载时获取数据
onMounted(() => {
  fetchReportList()
})
</script>

<style scoped>
.report-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item .label {
  white-space: nowrap;
  color: #666;
  font-size: 14px;
}

.search-item .el-input {
  width: 200px;
}

.search-item .el-date-picker {
  width: 280px;
}

.search-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.report-content {
  padding: 20px;
  min-height: 400px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.report-meta {
  flex: 1;
}

.report-meta p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.report-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.section h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.section-content {
  color: #666;
  line-height: 1.8;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.report-content h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.report-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

.report-info p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.report-detail h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.report-detail p {
  color: #666;
  line-height: 1.8;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: flex-start;
}

.action-buttons .el-button {
  padding: 0 8px;
  font-size: 13px;
}
</style>
