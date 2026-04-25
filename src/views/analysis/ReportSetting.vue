<template>
  <div class="report-setting">
    <div class="header">
      <div class="header-left">
        <h2>舆情报告设置</h2>
        <span class="count-badge">运行中{{ runningCount }}个</span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchForm.reportName"
          placeholder="请输入报告专题名"
          class="search-input"
          clearable
        />
        <el-select v-model="searchForm.reportType" placeholder="报告类型" clearable style="width: 120px;">
          <el-option label="即时报告" :value="1" />
          <el-option label="定时报告" :value="2" />
        </el-select>
        <el-select v-model="searchForm.statusEnabled" placeholder="启用状态" clearable style="width: 120px;">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
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
        :key="item.specialReportId"
        class="report-card"
      >
        <div class="card-header">
          <div class="card-title">
            <el-icon class="title-icon"><Document /></el-icon>
            <span>{{ item.reportName }}</span>
          </div>
          <div class="tags">
            <el-tag
              :type="item.reportType === 1 ? 'success' : 'primary'"
              size="small"
            >
              {{ item.reportType === 1 ? '即时报告' : '定时报告' }}
            </el-tag>
            <el-tag
              :type="getStatusType(item.statusEnabled)"
              size="small"
            >
              {{ item.statusEnabled === 1 ? '启用' : '停用' }}
            </el-tag>
            <el-tag
              :type="getExecuteStatusType(item.executeStatus)"
              size="small"
            >
              {{ getExecuteStatusLabel(item.executeStatus) }}
            </el-tag>
          </div>
        </div>

        <div class="card-content">
          <div class="info-row">
            <span class="label">监测词组</span>
            <span class="value">{{ formatKeywords(item.monitorKeywords) }}</span>
          </div>
          <div class="info-row">
            <span class="label">数据源</span>
            <span class="value">{{ item.dataSource === 'integration' ? '综合' : (item.dataSource || '-') }}</span>
          </div>
          <div class="info-row">
            <span class="label">监测地域</span>
            <span class="value">{{ item.monitorRegion || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间</span>
            <span class="value">{{ item.createTime }}</span>
          </div>
          <div class="info-row" v-if="item.lastExecuteTime">
            <span class="label">上次执行</span>
            <span class="value">{{ item.lastExecuteTime }}</span>
          </div>
        </div>

        <div class="card-footer">
          <el-button text type="primary" @click="handleEdit(item)">编辑</el-button>
          <el-button text type="danger" @click="handleDelete(item)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingItem ? '编辑舆情报告' : '新增舆情报告'"
      width="600px"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="110px">
        <el-form-item label="报告名称" prop="reportName">
          <el-input v-model="formData.reportName" placeholder="请输入报告名称" />
        </el-form-item>

        <el-form-item label="监测词组" prop="keywordGroups">
          <div class="keyword-groups">
            <div class="help-text">
              <el-icon><InfoFilled /></el-icon>
              <span>同组内关键词为并集查询（OR），不同组间为交集查询（AND），最多支持3个词组</span>
            </div>

            <div
              v-for="(group, groupIndex) in formData.keywordGroups"
              :key="groupIndex"
              class="keyword-group"
            >
              <div class="group-header">
                <span class="group-label">词组 {{ groupIndex + 1 }}</span>
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="removeGroup(groupIndex)"
                  v-if="formData.keywordGroups.length > 1"
                >
                  删除词组
                </el-button>
              </div>

              <div class="keywords-container">
                <el-tag
                  v-for="(keyword, keywordIndex) in group.keywords"
                  :key="keywordIndex"
                  closable
                  @close="removeKeyword(groupIndex, keywordIndex)"
                  class="keyword-tag"
                >
                  {{ keyword }}
                </el-tag>

                <el-input
                  v-if="group.inputVisible"
                  v-model="group.inputValue"
                  ref="keywordInputRef"
                  size="small"
                  class="keyword-input"
                  placeholder="输入关键词后按回车"
                  @keyup.enter="handleInputConfirm(groupIndex)"
                  @blur="handleInputConfirm(groupIndex)"
                />
                <el-button
                  v-else
                  size="small"
                  @click="showInput(groupIndex)"
                  class="add-keyword-btn"
                >
                  <el-icon><Plus /></el-icon>
                  <span>添加关键词</span>
                </el-button>
              </div>
            </div>

            <el-button
              type="primary"
              plain
              size="small"
              @click="addGroup"
              :disabled="formData.keywordGroups.length >= 3"
              class="add-group-btn"
            >
              + 添加词组 ({{ formData.keywordGroups.length }}/3)
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="目标来源" prop="dataSource">
          <el-select v-model="formData.dataSource" placeholder="请选择目标来源" style="width: 100%">
            <el-option label="默认" value="integration" />
          </el-select>
        </el-form-item>

        <!-- 目标来源参数配置 -->
        <el-form-item label="来源参数" v-if="formData.dataSource === 'integration'">
          <div class="source-params">
            <div class="param-item">
              <span class="param-label">查询倍率：</span>
              <el-input-number
                v-model="formData.sourceParams.page"
                :min="1"
                :max="3"
                :step="1"
                controls-position="right"
                style="width: 120px;"
              />
              <span class="param-hint">（1-3倍，默认1倍）</span>
            </div>
            <div class="param-item">
              <span class="param-label">新闻来源：</span>
              <el-select
                v-model="formData.sourceParams.sources"
                multiple
                placeholder="请选择新闻来源"
                style="width: 300px;"
              >
                <el-option label="综合" value="综合" />
                <el-option label="社会" value="社会" />
              </el-select>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="监测地域">
          <el-input v-model="formData.monitorRegion" placeholder="请输入监测地域" />
        </el-form-item>

        <el-form-item label="报告类型" prop="reportType">
          <el-radio-group v-model="formData.reportType" @change="handleReportTypeChange">
            <el-radio :label="1">即时报告</el-radio>
            <el-radio :label="2">定时报告</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 即时报告：日期范围 -->
        <el-form-item v-if="formData.reportType === 1" label="监测时间" prop="dateRange">
          <el-date-picker
            v-model="formData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- 定时报告：周期配置 -->
        <template v-if="formData.reportType === 2">
          <el-form-item label="报告周期" prop="cycle">
            <el-select v-model="formData.cycle" placeholder="请选择报告周期" style="width: 100%">
              <el-option label="按天" value="daily" />
              <el-option label="按周" value="weekly" />
              <el-option label="按月" value="monthly" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="formData.cycle === 'weekly'" label="星期" prop="weekday">
            <el-select v-model="formData.weekday" placeholder="请选择星期" style="width: 100%">
              <el-option label="星期一" :value="1" />
              <el-option label="星期二" :value="2" />
              <el-option label="星期三" :value="3" />
              <el-option label="星期四" :value="4" />
              <el-option label="星期五" :value="5" />
              <el-option label="星期六" :value="6" />
              <el-option label="星期日" :value="7" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="formData.cycle === 'monthly'" label="日期" prop="day">
            <el-select v-model="formData.day" placeholder="请选择日期" style="width: 100%">
              <el-option v-for="d in 31" :key="d" :label="`${d}号`" :value="d" />
            </el-select>
          </el-form-item>

          <el-form-item label="执行时间" prop="time">
            <el-time-picker
              v-model="formData.time"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择执行时间"
              style="width: 100%"
            />
          </el-form-item>
        </template>

        <el-form-item label="状态">
          <el-switch
            v-model="formData.statusEnabled"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document, InfoFilled } from '@element-plus/icons-vue'
import { getReportListAPI, deleteReportAPI, createReportAPI, editReportAPI } from '@/api/index'

// 搜索表单
const searchForm = ref({
  reportName: '',
  reportType: null,
  statusEnabled: null
})

// 列表数据
const reportList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 运行中数量
const runningCount = computed(() => {
  return reportList.value.filter(item => item.statusEnabled === 1).length
})

// 对话框
const showAddDialog = ref(false)
const editingItem = ref(null)
const formRef = ref(null)
const submitting = ref(false)
const keywordInputRef = ref([])

// 表单数据
const formData = reactive({
  reportName: '',
  keywordGroups: [
    { keywords: [], inputVisible: false, inputValue: '' }
  ],
  dataSource: '',
  sourceParams: {
    page: 1,
    sources: []
  },
  monitorRegion: '',
  reportType: 1,
  // 即时报告字段
  dateRange: [],
  // 定时报告字段
  cycle: '',
  weekday: null,
  day: null,
  time: '',
  statusEnabled: 1
})

// 表单验证规则
const formRules = {
  reportName: [
    { required: true, message: '请输入报告名称', trigger: 'blur' }
  ],
  keywordGroups: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        const hasKeywords = value.some(group => group.keywords && group.keywords.length > 0)
        if (!hasKeywords) {
          callback(new Error('请至少添加一个监测词组'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  dataSource: [
    { required: true, message: '请选择目标来源', trigger: 'change' }
  ],
  reportType: [
    { required: true, message: '请选择报告类型', trigger: 'change' }
  ],
  dateRange: [
    { required: true, message: '请选择监测时间', trigger: 'change' }
  ],
  cycle: [
    { required: true, message: '请选择报告周期', trigger: 'change' }
  ],
  weekday: [
    { required: true, message: '请选择星期', trigger: 'change' }
  ],
  day: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择执行时间', trigger: 'change' }
  ]
}

// 初始化
onMounted(() => {
  fetchReportList()
})

// 获取列表
const fetchReportList = async () => {
  try {
    const res = await getReportListAPI({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      reportName: searchForm.value.reportName || undefined,
      reportType: searchForm.value.reportType,
      statusEnabled: searchForm.value.statusEnabled
    })

    if (res.code === 1 && res.data) {
      reportList.value = (res.data.reportList || []).map(item => ({
        ...item,
        createTime: formatTime(item.createTime),
        lastExecuteTime: formatTime(item.lastExecuteTime)
      }))
      total.value = res.data.total || 0
      if (res.data.pageSize) {
        pageSize.value = res.data.pageSize
      }
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  }
}

// 格式化关键词
const formatKeywords = (keywords) => {
  if (!keywords) return '-'
  try {
    const obj = typeof keywords === 'string' ? JSON.parse(keywords) : keywords
    const groups = obj.keywordGroups || []
    return groups.map(group => group.join(' + ')).join(' | ') || '-'
  } catch {
    return '-'
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// 获取状态类型
const getStatusType = (status) => {
  return status === 1 ? 'success' : 'info'
}

// 获取执行状态类型
const getExecuteStatusType = (status) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'warning'
    case 2: return 'primary'
    case 3: return 'success'
    default: return 'info'
  }
}

// 获取执行状态标签
const getExecuteStatusLabel = (status) => {
  switch (status) {
    case 0: return '等待执行'
    case 1: return '爬取数据中'
    case 2: return '生成报告中'
    case 3: return '已完成'
    default: return '未知'
  }
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  fetchReportList()
}

// 清空
const handleClear = () => {
  searchForm.value = {
    reportName: '',
    reportType: null,
    statusEnabled: null
  }
  currentPage.value = 1
  fetchReportList()
}

// 分页
const handleSizeChange = () => {
  fetchReportList()
}

const handleCurrentChange = () => {
  fetchReportList()
}

// 编辑
const handleEdit = (item) => {
  console.log('编辑项原始数据:', item)

  // 解析监测词组
  let keywordGroups = [{ keywords: [], inputVisible: false, inputValue: '' }]
  try {
    console.log('原始 monitorKeywords:', item.monitorKeywords)
    let monitorKeywords = item.monitorKeywords

    // 如果是字符串，先解析
    if (typeof monitorKeywords === 'string') {
      monitorKeywords = JSON.parse(monitorKeywords)
    }

    console.log('解析后 monitorKeywords:', monitorKeywords)

    if (monitorKeywords && monitorKeywords.keywordGroups && monitorKeywords.keywordGroups.length > 0) {
      keywordGroups = monitorKeywords.keywordGroups.map(keywords => ({
        keywords: Array.isArray(keywords) ? keywords : [],
        inputVisible: false,
        inputValue: ''
      }))
    }

    console.log('最终 keywordGroups:', keywordGroups)
  } catch (e) {
    console.error('解析监测词组失败:', e, item.monitorKeywords)
  }

  // 解析 params
  let sourceParams = { page: 1, sources: [] }
  try {
    if (item.params) {
      let params = item.params
      if (typeof params === 'string') {
        params = JSON.parse(params)
      }
      sourceParams = params
    }
  } catch (e) {
    console.error('解析params失败:', e)
  }

  // 解析 typeParams
  let dateRange = []
  let cycle = ''
  let weekday = null
  let day = null
  let time = ''

  try {
    if (item.typeParams) {
      console.log('原始 typeParams:', item.typeParams)
      let typeParams = item.typeParams

      // 如果是字符串，先解析
      if (typeof typeParams === 'string') {
        typeParams = JSON.parse(typeParams)
      }

      console.log('解析后 typeParams:', typeParams)
      console.log('reportType:', item.reportType)

      if (item.reportType === 1) {
        // 即时报告
        if (typeParams.start_date && typeParams.end_date) {
          dateRange = [typeParams.start_date, typeParams.end_date]
        }
      } else if (item.reportType === 2) {
        // 定时报告
        cycle = typeParams.cycle || ''
        time = typeParams.time || ''
        if (typeParams.weekday !== undefined && typeParams.weekday !== null) {
          weekday = typeParams.weekday
        }
        if (typeParams.day !== undefined && typeParams.day !== null) {
          day = typeParams.day
        }
      }

      console.log('解析后时间参数:', { dateRange, cycle, weekday, day, time })
    }
  } catch (e) {
    console.error('解析typeParams失败:', e, item.typeParams)
  }

  // 填充表单数据
  formData.reportName = item.reportName
  formData.keywordGroups = keywordGroups
  formData.dataSource = item.dataSource
  formData.sourceParams = sourceParams
  formData.monitorRegion = item.monitorRegion || ''
  formData.reportType = item.reportType
  formData.dateRange = dateRange
  formData.cycle = cycle
  formData.weekday = weekday
  formData.day = day
  formData.time = time
  formData.statusEnabled = item.statusEnabled

  console.log('填充后的表单数据:', JSON.parse(JSON.stringify(formData)))

  // 设置编辑模式
  editingItem.value = item
  showAddDialog.value = true
}

// 删除
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${item.reportName}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await deleteReportAPI(item.specialReportId)
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

// 添加词组
const addGroup = () => {
  if (formData.keywordGroups.length >= 3) {
    ElMessage.warning('最多只能添加3个词组')
    return
  }
  formData.keywordGroups.push({
    keywords: [],
    inputVisible: false,
    inputValue: ''
  })
}

// 删除词组
const removeGroup = (groupIndex) => {
  formData.keywordGroups.splice(groupIndex, 1)
}

// 显示输入框
const showInput = (groupIndex) => {
  formData.keywordGroups[groupIndex].inputVisible = true
  nextTick(() => {
    const inputs = keywordInputRef.value
    if (inputs && inputs[groupIndex]) {
      inputs[groupIndex].focus()
    }
  })
}

// 确认输入关键词
const handleInputConfirm = (groupIndex) => {
  const group = formData.keywordGroups[groupIndex]
  const inputValue = group.inputValue?.trim()

  if (inputValue) {
    if (!group.keywords) {
      group.keywords = []
    }
    if (!group.keywords.includes(inputValue)) {
      group.keywords.push(inputValue)
    }
  }

  group.inputVisible = false
  group.inputValue = ''
}

// 删除关键词
const removeKeyword = (groupIndex, keywordIndex) => {
  formData.keywordGroups[groupIndex].keywords.splice(keywordIndex, 1)
}

// 报告类型切换
const handleReportTypeChange = () => {
  // 切换类型时清空相关字段
  if (formData.reportType === 1) {
    // 切换到即时报告，清空定时报告字段
    formData.cycle = ''
    formData.weekday = null
    formData.day = null
    formData.time = ''
  } else {
    // 切换到定时报告，清空即时报告字段
    formData.dateRange = []
  }
}

// 重置表单
const resetForm = () => {
  formData.reportName = ''
  formData.keywordGroups = [
    { keywords: [], inputVisible: false, inputValue: '' }
  ]
  formData.dataSource = ''
  formData.sourceParams = {
    page: 1,
    sources: []
  }
  formData.monitorRegion = ''
  formData.reportType = 1
  formData.dateRange = []
  formData.cycle = ''
  formData.weekday = null
  formData.day = null
  formData.time = ''
  formData.statusEnabled = 1
  editingItem.value = null
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    // 构建typeParams参数
    let typeParams = {}
    if (formData.reportType === 1) {
      // 即时报告
      typeParams = {
        start_date: formData.dateRange[0],
        end_date: formData.dateRange[1]
      }
    } else {
      // 定时报告
      typeParams = {
        cycle: formData.cycle,
        time: formData.time
      }

      // 根据周期类型添加额外参数
      if (formData.cycle === 'weekly') {
        typeParams.weekday = formData.weekday
      } else if (formData.cycle === 'monthly') {
        typeParams.day = formData.day
      }
    }

    // 构建监测关键词对象
    const monitorKeywords = {
      keywordGroups: formData.keywordGroups
        .filter(group => group.keywords && group.keywords.length > 0)
        .map(group => group.keywords)
    }

    // 构建API参数
    const params = {
      reportName: formData.reportName,
      monitorKeywords: JSON.stringify(monitorKeywords),
      dataSource: formData.dataSource,
      params: JSON.stringify(formData.sourceParams),
      monitorRegion: formData.monitorRegion || '',
      reportType: formData.reportType,
      typeParams: JSON.stringify(typeParams),
      statusEnabled: formData.statusEnabled
    }

    console.log('提交参数:', params)

    let res
    if (editingItem.value) {
      // 编辑模式：调用编辑接口
      res = await editReportAPI({
        ...params,
        specialReportId: editingItem.value.specialReportId
      })
    } else {
      // 新增模式：调用创建接口
      res = await createReportAPI(params)
    }

    if (res.code === 1) {
      ElMessage.success(editingItem.value ? '编辑成功' : '创建成功')
      showAddDialog.value = false
      resetForm()
      fetchReportList()
    } else {
      ElMessage.error(res.msg || (editingItem.value ? '编辑失败' : '创建失败'))
    }
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error('请完善必填项')
    }
  } finally {
    submitting.value = false
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.keyword-groups {
  width: 100%;
}

.help-text {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 13px;
  margin-bottom: 15px;
}

.keyword-group {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.group-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.keywords-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.keyword-tag {
  margin: 0;
}

.keyword-input {
  width: 120px;
}

.add-keyword-btn {
  border-style: dashed;
}

.add-group-btn {
  width: 100%;
  margin-top: 5px;
}

.source-params {
  width: 100%;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.param-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
</style>