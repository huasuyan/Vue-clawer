<template>
  <div class="task-container">
    <!-- 查询栏  使用quertForm存储请求数据-->
    <div class="search-bar">
      <div class="search-row">
        <div class="search-item">
          <label>爬虫名称：</label>
          <el-input v-model="queryForm.crawlerName" placeholder="请输入" clearable style="width: 200px"></el-input>
        </div>
        <div class="search-item">
          <label>执行方式：</label>
          <el-select v-model="queryForm.scheduleType" placeholder="请选择" clearable style="width: 200px">
            <el-option label="定时任务" value="CRON"></el-option>
            <el-option label="手动执行" value="NONE"></el-option>
          </el-select>
        </div>
        <div class="search-item">
          <label>配置方式：</label>
          <el-select v-model="queryForm.configMethod" placeholder="请选择" clearable style="width: 200px">
            <el-option label="流程组件" :value="1"></el-option>
            <el-option label="脚本" :value="0"></el-option>
          </el-select>
        </div>
      </div>
      <div class="search-row">
        <div class="search-item">
          <label>启用状态：</label>
          <el-select v-model="queryForm.triggerStatus" placeholder="请选择" clearable style="width: 200px">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </div>
        <div class="search-item">
          <label>执行日期：</label>
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px"
          />
        </div>
        <div class="search-buttons">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 页面标题和新增按钮 -->
    <div class="page-header">
      <h2 class="page-title">爬虫管理</h2>
      <el-button type="primary" @click="addTask">+ 新增</el-button>
    </div>

    <!-- 任务列表 -->
    <el-table :data="taskList" style="width: 100%" border>
      <el-table-column prop="name" label="爬虫名称" min-width="120"></el-table-column>
      <el-table-column prop="cron" label="Cron 表达式" width="150">
        <template #default="scope">
          <div>{{ scope.row.cron }}</div>
          <div class="cron-desc">{{ scope.row.cronDesc }}</div>
          <div class="next-time">下一时刻: {{ scope.row.nextTime }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="execMethod" label="执行方式" width="100">
        <template #default="scope">
          {{ scope.row.execMethod === 'CRON' ? '定时任务' : scope.row.execMethod === 'NONE' ? '手动执行' : scope.row.execMethod }}
        </template>
      </el-table-column>
      <el-table-column prop="configMethod" label="配置方式" width="100"></el-table-column>
      <el-table-column prop="lastExecTime" label="上次执行时间" width="160"></el-table-column>
      <el-table-column prop="nextExecTime" label="下次执行时间" width="160"></el-table-column>
      <el-table-column prop="description" label="爬虫描述" min-width="100"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="160"></el-table-column>
      <el-table-column label="启用状态" width="100" align="center">
        <template #default="scope">
          <el-switch
            v-if="scope.row.execMethod === 'CRON'"
            v-model="scope.row.enabled"
            @change="toggleStatus(scope.row)"
          ></el-switch>
          <span v-else style="color: #909399;">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="executeTask(scope.row)">执行</el-button>
          <el-button link type="primary" size="small" @click="editTask(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="deleteTask(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="prev, pager, next, sizes, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑爬虫对话框 -->
    <el-dialog v-model="showAddDialog" :title="dialogTitle" width="700px" @close="resetForm">
      <el-form :model="crawlerForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="爬虫名称" prop="crawlerName">
          <el-input v-model="crawlerForm.crawlerName" placeholder="请输入爬虫名称"></el-input>
        </el-form-item>

        <el-form-item label="爬虫描述" prop="jobDesc">
          <el-input v-model="crawlerForm.jobDesc" type="textarea" :rows="2" placeholder="请输入爬虫描述"></el-input>
        </el-form-item>

        <el-form-item label="配置方式" prop="configMethod">
          <el-radio-group v-model="crawlerForm.configMethod">
            <el-radio :label="0">脚本</el-radio>
            <el-radio :label="1">流程组件</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 脚本方式：上传文件或手动输入 -->
        <el-form-item v-if="crawlerForm.configMethod === 0" label="Python脚本" prop="crawlerSource">
          <el-tabs v-model="scriptInputType">
            <el-tab-pane label="上传文件" name="upload">
              <el-upload
                :auto-upload="false"
                :on-change="handleFileChange"
                :show-file-list="true"
                :limit="1"
                accept=".py"
                drag
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">拖拽文件到此处或<em>点击上传</em></div>
                <template #tip>
                  <div class="el-upload__tip">只能上传 .py 文件</div>
                </template>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="手动输入" name="manual">
              <el-input
                v-model="crawlerForm.crawlerSource"
                type="textarea"
                :rows="10"
                placeholder="请输入Python代码"
              ></el-input>
            </el-tab-pane>
          </el-tabs>
        </el-form-item>

        <!-- 流程组件方式：配置流程（暂时用文本框代替） -->
        <el-form-item v-if="crawlerForm.configMethod === 1" label="流程配置" prop="crawlerSource">
          <el-input
            v-model="crawlerForm.crawlerSource"
            type="textarea"
            :rows="10"
            placeholder="流程组件配置（JSON格式）"
          ></el-input>
          <div style="margin-top: 8px; color: #909399; font-size: 12px;">
            提示：这里应该是可视化流程配置器，目前暂用文本框代替
          </div>
        </el-form-item>

        <el-form-item label="执行方式" prop="scheduleType">
          <el-radio-group v-model="crawlerForm.scheduleType">
            <el-radio label="CRON">定时执行</el-radio>
            <el-radio label="NONE">手动执行</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="crawlerForm.scheduleType === 'CRON'" label="Cron表达式" prop="scheduleConf">
          <el-input v-model="crawlerForm.scheduleConf" placeholder="例如: 0 0 12 * * ? *">
            <template #append>
              <el-button @click="showCronHelper">帮助</el-button>
            </template>
          </el-input>
          <div style="margin-top: 8px; color: #909399; font-size: 12px;">
            {{ parseCron(crawlerForm.scheduleConf) }}
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getCrawlerListAPI, createCrawlerAPI, getCrawlerByIdAPI, updateCrawlerAPI, deleteCrawlerAPI, executeCrawlerAPI, activateCrawlerAPI } from '@/api'

// 查询表单
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  crawlerName: '',
  scheduleType: '',
  configMethod: '',
  triggerStatus: '',
  dateRange: []
})

const total = ref(0)

// 任务列表
const taskList = ref([])

// 新增对话框
const showAddDialog = ref(false)
const dialogTitle = ref('新增爬虫')
const submitting = ref(false)
const formRef = ref(null)
const scriptInputType = ref('upload')
const isEditMode = ref(false) // 是否为编辑模式
const editingCrawlerId = ref(null) // 正在编辑的爬虫ID

// 爬虫表单
const crawlerForm = ref({
  crawlerName: '',
  jobDesc: '',
  configMethod: 0, // 0-脚本, 1-流程组件
  crawlerSource: '',
  scheduleType: 'CRON', // CRON-定时执行, NONE-手动执行
  scheduleConf: ''
})

// 表单验证规则
const formRules = {
  crawlerName: [
    { required: true, message: '请输入爬虫名称', trigger: 'blur' }
  ],
  jobDesc: [
    { required: true, message: '请输入爬虫描述', trigger: 'blur' }
  ],
  crawlerSource: [
    { required: true, message: '请输入或上传爬虫代码', trigger: 'blur' }
  ],
  scheduleType: [
    { required: true, message: '请选择执行方式', trigger: 'change' }
  ],
  scheduleConf: [
    { required: true, message: '请输入Cron表达式', trigger: 'blur' }
  ]
}

// 解析 cron 表达式（支持 6位/7位格式：秒 分 时 日 月 周 [年]）
const parseCron = (cron) => {
  if (!cron) return '未设置'

  const parts = cron.trim().split(/\s+/)
  if (parts.length < 6) return 'Cron 格式错误'

  const [second, minute, hour, day, month, week] = parts

  // 每秒
  if (second === '*' && minute === '*' && hour === '*' && day === '*' && week === '?') {
    return '每秒执行一次'
  }

  // 每隔 N 秒 0/59 * * * * ?
  if (second.startsWith('0/') && minute === '*' && hour === '*' && day === '*' && week === '?') {
    return `每 ${second.split('/')[1]} 秒执行一次`
  }

  // 每分钟 0 * * * * ?
  if (second === '0' && minute === '*' && hour === '*' && day === '*' && week === '?') {
    return '每分钟执行一次'
  }

  // 每隔 N 分钟 0 0/5 * * * ?
  if (second === '0' && minute.startsWith('0/') && hour === '*' && day === '*' && week === '?') {
    return `每 ${minute.split('/')[1]} 分钟执行一次`
  }

  // 每小时 0 0 * * * ?
  if (second === '0' && minute === '0' && hour === '*' && day === '*' && week === '?') {
    return '每小时执行一次'
  }

  // 每隔 N 小时 0 0 0/2 * * ?
  if (second === '0' && minute === '0' && hour.startsWith('0/') && day === '*' && week === '?') {
    return `每 ${hour.split('/')[1]} 小时执行一次`
  }

  // 每天固定时间 0 0 12 * * ?
  if (second === '0' && minute === '0' && !isNaN(hour) && day === '*' && week === '?') {
    return `每天 ${hour} 点执行`
  }

  // 每周 0 0 12 ? * 2
  if (second === '0' && minute === '0' && !isNaN(hour) && day === '?' && !isNaN(week)) {
    const weekMap = { 1: '周日', 2: '周一', 3: '周二', 4: '周三', 5: '周四', 6: '周五', 7: '周六' }
    return `每周 ${weekMap[week]} ${hour} 点执行`
  }

  // 每月 0 0 12 1 * ?
  if (second === '0' && minute === '0' && !isNaN(hour) && !isNaN(day) && month === '*' && week === '?') {
    return `每月 ${day} 日 ${hour} 点执行`
  }

  return cron
}

// 加载数据
const loadData = async () => {
  try {
    const params = {
      pageNum: queryForm.value.pageNum,
      pageSize: queryForm.value.pageSize,
      crawlerName: queryForm.value.crawlerName || undefined,
      scheduleType: queryForm.value.scheduleType || undefined,
      configMethod: queryForm.value.configMethod !== '' ? queryForm.value.configMethod : undefined,
      triggerStatus: queryForm.value.triggerStatus !== '' ? queryForm.value.triggerStatus : undefined
    }

    const res = await getCrawlerListAPI(params)

    if (res.code === 1) {
      taskList.value = res.data.map(item => ({
        id: item.crawlerId,
        name: item.crawlerName,
        cron: item.scheduleConf,
        cronDesc: parseCron(item.scheduleConf),
        nextTime: item.nextTime || '',
        execMethod: item.scheduleType,
        configMethod: item.configMethod === 0 ? '脚本' : '流程组件',
        lastExecTime: item.triggerLastTime,
        nextExecTime: item.triggerNextTime,
        description: item.jobDesc,
        updateTime: item.updateTime,
        enabled: item.triggerStatus === 1
      }))
      total.value = res.total || res.data.length
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (err) {
    console.error('查询失败:', err)
  }
}

// 查询
const handleSearch = () => {
  queryForm.value.pageNum = 1
  loadData()
}

// 重置/查看
const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    crawlerName: '',
    scheduleType: '',
    configMethod: '',
    triggerStatus: '',
    dateRange: []
  }
  loadData()
}

// 新增任务
const addTask = () => {
  dialogTitle.value = '新增爬虫'
  isEditMode.value = false
  editingCrawlerId.value = null
  showAddDialog.value = true
  resetForm()
}

// 重置表单
const resetForm = () => {
  crawlerForm.value = {
    crawlerName: '',
    jobDesc: '',
    configMethod: 0,
    crawlerSource: '',
    scheduleType: 'CRON',
    scheduleConf: ''
  }
  scriptInputType.value = 'upload'
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 处理文件上传
const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    crawlerForm.value.crawlerSource = e.target.result
    ElMessage.success('文件读取成功')
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsText(file.raw)
}

// Cron表达式帮助
const showCronHelper = () => {
  ElMessageBox.alert(
    '格式：秒 分 时 日 月 周 [年]\n\n' +
    '示例：\n' +
    '0 0 12 * * ? - 每天12点执行\n' +
    '0 */5 * * * ? - 每5分钟执行\n' +
    '0 0 0 1 * ? - 每月1号0点执行\n' +
    '0 0 9-18 * * MON-FRI - 工作日9-18点每小时执行',
    'Cron表达式说明',
    { confirmButtonText: '知道了' }
  )
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 如果是手动执行，清空 scheduleConf
    if (crawlerForm.value.scheduleType === 'NONE') {
      crawlerForm.value.scheduleConf = ''
    }

    submitting.value = true

    try {
      let res

      if (isEditMode.value) {
        // 编辑模式：调用更新接口
        res = await updateCrawlerAPI({
          crawlerId: editingCrawlerId.value,
          crawlerName: crawlerForm.value.crawlerName,
          jobDesc: crawlerForm.value.jobDesc,
          crawlerSource: crawlerForm.value.crawlerSource,
          scheduleType: crawlerForm.value.scheduleType,
          scheduleConf: crawlerForm.value.scheduleConf || undefined,
          configMethod: crawlerForm.value.configMethod,
          triggerStatus: 1 // 默认启用
        })
      } else {
        // 新增模式：调用创建接口
        res = await createCrawlerAPI({
          crawlerName: crawlerForm.value.crawlerName,
          jobDesc: crawlerForm.value.jobDesc,
          crawlerSource: crawlerForm.value.crawlerSource,
          scheduleType: crawlerForm.value.scheduleType,
          scheduleConf: crawlerForm.value.scheduleConf || undefined
        })
      }

      if (res.code === 1) {
        ElMessage.success(isEditMode.value ? '修改成功' : '创建成功')
        showAddDialog.value = false
        loadData() // 刷新列表
      } else {
        ElMessage.error(res.msg || (isEditMode.value ? '修改失败' : '创建失败'))
      }

    } catch (err) {
      console.error('提交失败:', err)
    } finally {
      submitting.value = false
    }
  })
}

// 执行爬虫
const executeTask = async (row) => {
  try {
    const res = await executeCrawlerAPI(row.id)

    if (res.code === 1) {
      ElMessage.success('爬虫执行成功')
    } else {
      ElMessage.error(res.msg || '爬虫执行失败')
    }
  } catch (err) {
    ElMessage.error('爬虫执行失败，请重试')
    console.error('执行爬虫失败:', err)
  }
}

// 编辑任务
const editTask = async (row) => {
  try {
    // 调用接口查询爬虫详情
    const res = await getCrawlerByIdAPI(row.id)

    if (res.code === 1 && res.data) {
      const data = res.data

      // 填充表单
      crawlerForm.value = {
        crawlerName: data.crawlerName,
        jobDesc: data.jobDesc,
        configMethod: data.configMethod,
        crawlerSource: data.crawlerSource || '',
        scheduleType: data.scheduleType,
        scheduleConf: data.scheduleConf || ''
      }

      // 设置编辑模式
      isEditMode.value = true
      editingCrawlerId.value = data.crawlerId
      dialogTitle.value = '编辑爬虫'
      showAddDialog.value = true

      // 根据 crawlerSource 是否为空设置输入方式
      scriptInputType.value = data.crawlerSource ? 'manual' : 'upload'

    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (err) {
    ElMessage.error('查询失败，请重试')
    console.error('查询爬虫详情失败:', err)
  }
}

// 删除任务
const deleteTask = (row) => {
  ElMessageBox.confirm(`确定删除爬虫"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCrawlerAPI(row.id)

      if (res.code === 1) {
        ElMessage.success('删除成功')
        loadData() // 刷新列表
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (err) {
      ElMessage.error('删除失败，请重试')
      console.error('删除爬虫失败:', err)
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 切换启用状态
const toggleStatus = async (row) => {
  try {
    const res = await activateCrawlerAPI(row.id)

    if (res.code === 1) {
      const status = row.enabled ? '启用' : '停止'
      ElMessage.success(`已${status}爬虫`)
      loadData() // 刷新列表
    } else {
      // 失败时恢复开关状态
      row.enabled = !row.enabled
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (err) {
    // 失败时恢复开关状态
    row.enabled = !row.enabled
    ElMessage.error('操作失败，请重试')
    console.error('切换爬虫状态失败:', err)
  }
}

// 分页处理
const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  loadData()
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.task-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
}

.search-bar {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.search-row:last-child {
  margin-bottom: 0;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  white-space: nowrap;
  font-size: 14px;
  color: #606266;
}

.search-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
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

.cron-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.next-time {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>