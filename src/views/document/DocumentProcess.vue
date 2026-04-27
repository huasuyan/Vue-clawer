<template>
  <div class="case-page">
    <div class="status-tabs">
      <div v-for="tab in statusTabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
           @click="changeTab(tab.key)">
        {{ tab.label }}<span v-if="tab.count !== undefined"> ({{ tab.count }})</span>
      </div>
    </div>

    <div class="filter-panel">
      <el-form :model="filterForm" inline>
        <el-form-item label="办件名称">
          <el-input v-model="filterForm.caseName" placeholder="请输入" clearable style="width:160px" />
        </el-form-item>
        <el-form-item label="办件等级">
          <el-select v-model="filterForm.caseLevel" placeholder="全部" clearable style="width:120px">
            <el-option label="紧急" :value="0" />
            <el-option label="高" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="一般" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker v-model="filterForm.createTimeStart" type="date" placeholder="开始日期" value-format="YYYY-MM-DD" style="width:140px" />
          <span style="margin:0 6px;color:#999">至</span>
          <el-date-picker v-model="filterForm.createTimeEnd" type="date" placeholder="结束日期" value-format="YYYY-MM-DD" style="width:140px" />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-date-picker v-model="filterForm.updateTimeStart" type="date" placeholder="开始日期" value-format="YYYY-MM-DD" style="width:140px" />
          <span style="margin:0 6px;color:#999">至</span>
          <el-date-picker v-model="filterForm.updateTimeEnd" type="date" placeholder="结束日期" value-format="YYYY-MM-DD" style="width:140px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" stripe style="width:100%" :header-cell-style="{fontSize:'16px',fontWeight:'bold'}" :cell-style="{fontSize:'15px'}">
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="caseName" label="办件名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="caseInfo" label="办件描述" min-width="220" show-overflow-tooltip />
        <el-table-column label="所属部门" width="140">
          <template #default="{ row }">{{ row.deptName || '-' }}</template>
        </el-table-column>
        <el-table-column label="办件等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.caseLevel)" size="default">{{ levelLabel(row.caseLevel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="stateTagType(row.state)" size="default">{{ stateLabel(row.state) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.triggerState === 1 ? 'success' : 'danger'" size="default">
              {{ row.triggerState === 1 ? '启用' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="涉案金额(元)" width="150" align="right">
          <template #default="{ row }">{{ row.money?.toLocaleString() ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="上次操作时间" width="180">
          <template #default="{ row }">{{ formatTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="op-row">
              <el-button link type="primary" size="small" @click="showDetail(row)">详情</el-button>
              <el-button v-if="row.state === 0" link type="primary" size="small" @click="handleSubmitText(row, 0)">办理意见</el-button>
              <el-button v-if="row.state === 1" link type="primary" size="small" @click="handleSubmitText(row, 1)">归档意见</el-button>
              <el-button v-if="row.state === 0" link type="primary" size="small" @click="handleSingleAction('process', row)">办理</el-button>
              <el-button v-if="row.state === 1" link type="primary" size="small" @click="handleSingleAction('archive', row)">归档</el-button>
            </div>
            <div class="op-row">
              <el-button v-if="row.triggerState === 0" link type="primary" size="small" @click="handleSubmitText(row, 2)">启用</el-button>
              <el-button v-if="row.triggerState === 1" link type="primary" size="small" @click="handleSubmitText(row, 3)">关闭</el-button>
              <el-button v-if="row.state === 0 || row.state === 1" link type="danger" size="small" @click="handleSubmitText(row, 4)">异常</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[10,20,50,100]"
          layout="total,sizes,prev,pager,next,jumper" :total="total" @size-change="fetchData" @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="办件详情" width="700px">
      <div v-if="detailData" class="detail-body">
        <div class="detail-section">
          <div class="detail-row"><span class="label">办件名称：</span><span>{{ detailData.caseName }}</span></div>
          <div class="detail-row"><span class="label">办件描述：</span><span>{{ detailData.caseInfo }}</span></div>
          <div class="detail-row"><span class="label">办件等级：</span><el-tag :type="levelTagType(detailData.caseLevel)" size="small">{{ levelLabel(detailData.caseLevel) }}</el-tag></div>
          <div class="detail-row"><span class="label">所属部门：</span><span>{{ detailData.deptName || '-' }}</span></div>
          <div class="detail-row"><span class="label">涉案金额：</span><span>{{ detailData.money ? detailData.money + ' 元' : '无' }}</span></div>
          <div class="detail-row"><span class="label">状态：</span><el-tag :type="stateTagType(detailData.state)" size="small">{{ stateLabel(detailData.state) }}</el-tag></div>
          <div class="detail-row"><span class="label">启用状态：</span><el-tag :type="detailData.triggerState === 1 ? 'success' : 'danger'" size="small">{{ detailData.triggerState === 1 ? '启用' : '关闭' }}</el-tag></div>
          <div class="detail-row"><span class="label">上次操作：</span><span>{{ formatTime(detailData.updateTime) }}</span></div>
        </div>
        <div class="detail-section">
          <div class="section-title">操作历史</div>
          <div v-if="textList.length === 0" style="color:#999;padding:12px 0;">暂无操作记录</div>
          <div v-for="item in textList" :key="item.textId" class="history-item">
            <div class="history-header">
              <el-tag :type="textTypeTag(item.type)" size="small">{{ textTypeLabel(item.type) }}</el-tag>
              <span class="history-time">{{ formatTime(item.createTime) }}</span>
            </div>
            <div class="history-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="textDialogVisible" :title="textDialogTitle" width="500px">
      <el-form :model="textForm">
        <el-form-item label="意见内容">
          <el-input v-model="textForm.content" type="textarea" :rows="4" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="textDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="textSubmitting" @click="handleTextSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCasePageListAPI, submitCaseTextAPI, processCaseAPI,
  archiveCaseAPI, closeCaseAPI, enableCaseAPI,
  markExceptionCaseAPI, getCaseTextListAPI
} from '@/api'

const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])
const activeTab = ref('pending')

const STATUS_MAP = { pending: 0, processing: 1, archived: 2, abnormal: 3 }
const statusTabs = computed(() => [
  { key: 'pending', label: '待办' },
  { key: 'processing', label: '办理中' },
  { key: 'archived', label: '已归档' },
  { key: 'closed', label: '已关闭', filter: { triggerState: 0 } },
  { key: 'abnormal', label: '异常' }
])

const filterForm = reactive({
  caseName: '', caseLevel: null,
  createTimeStart: '', createTimeEnd: '',
  updateTimeStart: '', updateTimeEnd: ''
})

const formatTime = (t) => {
  if (!t) return '-'
  const d = new Date(t)
  if (isNaN(d.getTime())) return t
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const levelLabel = (v) => ({ 0: '紧急', 1: '高', 2: '中', 3: '一般' }[v] || '未知')
const levelTagType = (v) => ({ 0: 'danger', 1: 'warning', 2: '', 3: 'info' }[v] || 'info')
const stateLabel = (v) => ({ 0: '待办', 1: '办理中', 2: '已归档', 3: '异常' }[v] || '未知')
const stateTagType = (v) => ({ 0: 'info', 1: 'primary', 2: 'success', 3: 'danger' }[v] || 'info')
const textTypeLabel = (v) => ({ 0: '办理意见', 1: '归档意见', 2: '启用说明', 3: '停用说明', 4: '异常说明' }[v] || '未知')
const textTypeTag = (v) => ({ 0: 'primary', 1: 'success', 2: 'warning', 3: 'danger', 4: 'danger' }[v] || 'info')

const buildParams = () => {
  const tab = statusTabs.value.find(t => t.key === activeTab.value)
  const params = { pageNum: pageNum.value, pageSize: pageSize.value }
  if (tab?.filter) Object.assign(params, tab.filter)
  const state = STATUS_MAP[activeTab.value]
  if (state !== undefined) params.state = state
  // 非"已关闭"分区只显示已启用的办件（triggerState=1）
  if (activeTab.value !== 'closed') params.triggerState = 1
  if (filterForm.caseName) params.caseName = filterForm.caseName
  if (filterForm.caseLevel !== null && filterForm.caseLevel !== '') params.caseLevel = filterForm.caseLevel
  if (filterForm.createTimeStart) params.createTimeStart = filterForm.createTimeStart + ' 00:00:00'
  if (filterForm.createTimeEnd) params.createTimeEnd = filterForm.createTimeEnd + ' 23:59:59'
  if (filterForm.updateTimeStart) params.updateTimeStart = filterForm.updateTimeStart + ' 00:00:00'
  if (filterForm.updateTimeEnd) params.updateTimeEnd = filterForm.updateTimeEnd + ' 23:59:59'
  return params
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCasePageListAPI(buildParams())
    if (res.code === 1) {
      tableData.value = res.data?.caseList || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '获取列表失败')
    }
  } catch (_) {
    ElMessage.error('网络异常')
  } finally {
    loading.value = false
  }
}

const changeTab = (key) => {
  activeTab.value = key
  pageNum.value = 1
  fetchData()
}

const handleReset = () => {
  filterForm.caseName = ''
  filterForm.caseLevel = null
  filterForm.createTimeStart = ''
  filterForm.createTimeEnd = ''
  filterForm.updateTimeStart = ''
  filterForm.updateTimeEnd = ''
  fetchData()
}

const selectedRows = computed(() => tableData.value.filter(r => r.selected))

const handleBatchProcess = async () => {
  const rows = selectedRows.value.length ? selectedRows.value : tableData.value
  const ids = rows.filter(r => r.state === 0).map(r => r.caseId)
  if (!ids.length) { ElMessage.warning('没有可办理的办件'); return }
  try {
    await ElMessageBox.confirm(`确定办理选中的 ${ids.length} 个办件？`, '提示')
    for (const id of ids) {
      const res = await processCaseAPI(id)
      if (res.code !== 1) { ElMessage.error(res.msg); break }
    }
    ElMessage.success('办理成功')
    fetchData()
  } catch (_) {}
}

const handleBatchArchive = async () => {
  const ids = tableData.value.filter(r => r.state === 1).map(r => r.caseId)
  if (!ids.length) { ElMessage.warning('没有可归档的办件'); return }
  try {
    await ElMessageBox.confirm(`确定归档选中的 ${ids.length} 个办件？`, '提示')
    for (const id of ids) {
      const res = await archiveCaseAPI(id)
      if (res.code !== 1) { ElMessage.error(res.msg); break }
    }
    ElMessage.success('归档成功')
    fetchData()
  } catch (_) {}
}

const handleBatchEnable = async () => {
  const ids = tableData.value.filter(r => r.triggerState === 0).map(r => r.caseId)
  if (!ids.length) { ElMessage.warning('没有可启用的办件'); return }
  try {
    await ElMessageBox.confirm(`确定启用选中的 ${ids.length} 个办件？`, '提示')
    for (const id of ids) {
      const res = await enableCaseAPI(id)
      if (res.code !== 1) { ElMessage.error(res.msg); break }
    }
    ElMessage.success('启用成功')
    fetchData()
  } catch (_) {}
}

const detailVisible = ref(false)
const detailData = ref(null)
const textList = ref([])

const showDetail = async (row) => {
  detailData.value = row
  textList.value = []
  detailVisible.value = true
  try {
    const res = await getCaseTextListAPI(row.caseId)
    if (res.code === 1) textList.value = res.data?.textList || []
  } catch (_) {}
}

const textDialogVisible = ref(false)
const textDialogTitle = ref('')
const textSubmitting = ref(false)
const textForm = ref({ content: '' })
let textTarget = null
let textType = 0

const handleSubmitText = (row, type) => {
  textTarget = row
  textType = type
  textForm.value = { content: '' }
  textDialogTitle.value = textTypeLabel(type)
  textDialogVisible.value = true
}

const handleTextSubmit = async () => {
  if (!textForm.value.content.trim()) { ElMessage.warning('请输入内容'); return }
  textSubmitting.value = true
  try {
    const res = await submitCaseTextAPI({ caseId: textTarget.caseId, type: textType, content: textForm.value.content })
    if (res.code !== 1) { ElMessage.error(res.msg); return }
    ElMessage.success('提交成功')
    textDialogVisible.value = false

    // 启用/关闭/异常 提交后自动执行状态变更
    if (textType === 2) {
      const ar = await enableCaseAPI(textTarget.caseId)
      if (ar.code === 1) ElMessage.success('启用成功')
    } else if (textType === 3) {
      const ar = await closeCaseAPI(textTarget.caseId)
      if (ar.code === 1) ElMessage.success('关闭成功')
    } else if (textType === 4) {
      const ar = await markExceptionCaseAPI(textTarget.caseId)
      if (ar.code === 1) ElMessage.success('标记异常成功')
    }
    fetchData()
  } catch (_) {
    ElMessage.error('操作失败')
  } finally {
    textSubmitting.value = false
  }
}

const handleSingleAction = async (action, row) => {
  const labelMap = { process: '办理', archive: '归档', enable: '启用', close: '关闭', exception: '标记异常' }
  const texts = {
    process: { check: row.state === 0, needText: 0 },
    archive: { check: row.state === 1, needText: 1 },
    enable: { check: row.triggerState === 0, needText: 2 },
    close: { check: row.triggerState === 1, needText: 3 },
    exception: { check: row.state === 0 || row.state === 1, needText: 4 }
  }
  const cfg = texts[action]
  if (!cfg.check) { ElMessage.warning('当前状态不允许此操作'); return }

  const label = labelMap[action]
  try {
    await ElMessageBox.confirm(`确定${label}该办件？`, '提示')
  } catch { return }

  let res
  if (action === 'process') res = await processCaseAPI(row.caseId)
  else if (action === 'archive') res = await archiveCaseAPI(row.caseId)
  else if (action === 'enable') res = await enableCaseAPI(row.caseId)
  else if (action === 'close') res = await closeCaseAPI(row.caseId)
  else if (action === 'exception') res = await markExceptionCaseAPI(row.caseId)

  if (res && res.code === 1) {
    ElMessage.success(`${label}成功`)
    fetchData()
  } else {
    ElMessage.error(res?.msg || `${label}失败`)
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.case-page { padding: 0; }
.status-tabs { display: flex; gap: 10px; margin-bottom: 16px; background: #fff; padding: 14px 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.tab-item { padding: 6px 20px; background: #f0f2f5; border-radius: 4px; cursor: pointer; font-size: 14px; color: #666; transition: all .3s; }
.tab-item:hover { background: #e6f0ff; color: #409eff; }
.tab-item.active { background: #409eff; color: #fff; }
.filter-panel { background: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.table-container { background: #fff; border-radius: 8px; padding: 16px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.table-buttons { margin-top: 12px; }
.op-row { display: flex; gap: 2px; flex-wrap: nowrap; white-space: nowrap; }
.op-row + .op-row { margin-top: 4px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 16px; }

.detail-body { padding: 0 8px; }
.detail-section { margin-bottom: 20px; }
.detail-section .section-title { font-size: 15px; font-weight: 600; color: #303133; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #409eff; }
.detail-row { display: flex; margin-bottom: 10px; font-size: 14px; }
.detail-row .label { min-width: 100px; color: #909399; }

.history-item { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.history-item:last-child { border-bottom: none; }
.history-header { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
.history-time { font-size: 12px; color: #909399; }
.history-content { font-size: 14px; color: #606266; padding-left: 4px; }
</style>
