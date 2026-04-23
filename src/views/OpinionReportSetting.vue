<template>
  <div class="opinion-report-setting">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">舆情报告设置</h2>
    </div>

    <!-- 舆情报告主题列表 -->
    <div class="theme-section">
      <h3 class="section-title">舆情报告主题</h3>
      <div class="theme-list">
        <div v-for="theme in themeList" :key="theme.id" class="theme-card">
          <div class="theme-header">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-actions">
              <el-button link type="primary" @click="handleEditTheme(theme)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteTheme(theme)">删除</el-button>
            </div>
          </div>
          <div class="theme-keywords">
            <el-tag v-for="(keyword, index) in theme.keywords" :key="index" size="small" type="info" style="margin-right: 5px;">
              {{ keyword }}
            </el-tag>
          </div>
          <div class="theme-config">
            <span class="config-item">报告类型：{{ theme.reportType }}</span>
            <span v-if="theme.reportType === '定时报告'" class="config-item">监测时间：{{ theme.scheduleTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增报告主题按钮 -->
    <div class="add-section">
      <el-button type="primary" @click="handleAdd">+ 新增舆情报告</el-button>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="报告名称">
          <el-input v-model="formData.reportName" placeholder="请输入报告名称"></el-input>
        </el-form-item>
        <el-form-item label="监测词组">
          <el-input v-model="formData.keywordsInput" placeholder="多个关键词用逗号分隔"></el-input>
        </el-form-item>
        <el-form-item label="报告主题类型">
          <el-select v-model="formData.reportTheme" placeholder="请选择报告主题" style="width: 100%;">
            <el-option label="政策解读" value="政策解读"></el-option>
            <el-option label="舆论热点" value="舆论热点"></el-option>
            <el-option label="行业分析" value="行业分析"></el-option>
            <el-option label="品牌监测" value="品牌监测"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报告类型">
          <el-radio-group v-model="formData.reportType">
            <el-radio label="即时报告">即时报告</el-radio>
            <el-radio label="定时报告">定时报告</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.reportType === '定时报告'" label="监测时间">
          <div class="schedule-config">
            <el-select v-model="formData.scheduleType" placeholder="请选择" style="width: 120px;">
              <el-option label="按天" value="daily"></el-option>
              <el-option label="按周" value="weekly"></el-option>
              <el-option label="按月" value="monthly"></el-option>
            </el-select>
            <el-time-picker
              v-if="formData.scheduleType === 'daily'"
              v-model="formData.dailyTime"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="选择时间"
              style="width: 150px;"
            />
            <div v-else-if="formData.scheduleType === 'weekly'" class="weekly-config">
              <el-select v-model="formData.weeklyDay" placeholder="请选择" style="width: 100px;">
                <el-option label="周一" value="1"></el-option>
                <el-option label="周二" value="2"></el-option>
                <el-option label="周三" value="3"></el-option>
                <el-option label="周四" value="4"></el-option>
                <el-option label="周五" value="5"></el-option>
                <el-option label="周六" value="6"></el-option>
                <el-option label="周日" value="7"></el-option>
              </el-select>
              <el-time-picker
                v-model="formData.weeklyTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间"
                style="width: 150px;"
              />
            </div>
            <div v-else-if="formData.scheduleType === 'monthly'" class="monthly-config">
              <el-select v-model="formData.monthlyDay" placeholder="日期" style="width: 80px;">
                <el-option v-for="d in 31" :key="d" :label="d + '日'" :value="d"></el-option>
              </el-select>
              <el-time-picker
                v-model="formData.monthlyTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="选择时间"
                style="width: 150px;"
              />
            </div>
          </div>
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
import { ElMessage, ElMessageBox } from 'element-plus'

// 主题列表
const themeList = ref([
  {
    id: 1,
    name: '政策解读报告',
    keywords: ['政策', '法规', '条例', '规定'],
    reportType: '即时报告',
    scheduleTime: '-'
  },
  {
    id: 2,
    name: '舆论热点监测',
    keywords: ['热点', '舆论', '关注', '热搜'],
    reportType: '定时报告',
    scheduleTime: '每天 09:00'
  },
  {
    id: 3,
    name: '行业趋势分析',
    keywords: ['行业', '趋势', '市场', '数据'],
    reportType: '定时报告',
    scheduleTime: '每周一 10:00'
  },
  {
    id: 4,
    name: '品牌声誉监测',
    keywords: ['品牌', '声誉', '口碑', '评价'],
    reportType: '定时报告',
    scheduleTime: '每月1日 08:00'
  }
])

// 对话框
const showDialog = ref(false)
const dialogTitle = ref('新增舆情报告')
const isEditMode = ref(false)
const editingId = ref(null)


// 表单数据
const formData = ref({
  reportName: '',
  keywordsInput: '',
  reportTheme: '',
  reportType: '即时报告',
  scheduleType: 'daily',
  dailyTime: '09:00',
  weeklyDay: '1',
  weeklyTime: '09:00',
  monthlyDay: 1,
  monthlyTime: '09:00'
})

// 获取监测时间描述
const getScheduleTime = () => {
  if (formData.value.reportType === '即时报告') {
    return '-'
  }
  if (formData.value.scheduleType === 'daily') {
    return `每天 ${formData.value.dailyTime}`
  }
  if (formData.value.scheduleType === 'weekly') {
    const dayMap = { '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六', '7': '周日' }
    return `每周${dayMap[formData.value.weeklyDay]} ${formData.value.weeklyTime}`
  }
  if (formData.value.scheduleType === 'monthly') {
    return `每月${formData.value.monthlyDay}日 ${formData.value.monthlyTime}`
  }
  return '-'
}

// 重置表单
const resetForm = () => {
  formData.value = {
    reportName: '',
    keywordsInput: '',
    reportTheme: '',
    reportType: '即时报告',
    scheduleType: 'daily',
    dailyTime: '09:00',
    weeklyDay: '1',
    weeklyTime: '09:00',
    monthlyDay: 1,
    monthlyTime: '09:00'
  }
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增舆情报告'
  isEditMode.value = false
  editingId.value = null
  resetForm()
  showDialog.value = true
}

// 编辑
const handleEditTheme = (theme) => {
  dialogTitle.value = '编辑舆情报告'
  isEditMode.value = true
  editingId.value = theme.id

  // 解析监测时间
  let scheduleType = 'daily'
  let dailyTime = '09:00'
  let weeklyDay = '1'
  let weeklyTime = '09:00'
  let monthlyDay = 1
  let monthlyTime = '09:00'

  if (theme.reportType === '定时报告' && theme.scheduleTime !== '-') {
    const timeMatch = theme.scheduleTime.match(/(\d{2}):(\d{2})/)
    if (timeMatch) {
      const time = `${timeMatch[1]}:${timeMatch[2]}`
      if (theme.scheduleTime.startsWith('每天')) {
        scheduleType = 'daily'
        dailyTime = time
      } else if (theme.scheduleTime.startsWith('每周')) {
        scheduleType = 'weekly'
        weeklyTime = time
        const dayMap = { '周一': '1', '周二': '2', '周三': '3', '周四': '4', '周五': '5', '周六': '6', '周日': '7' }
        for (const [day, val] of Object.entries(dayMap)) {
          if (theme.scheduleTime.includes(day)) {
            weeklyDay = val
            break
          }
        }
      } else if (theme.scheduleTime.startsWith('每月')) {
        scheduleType = 'monthly'
        monthlyTime = time
        const dayMatch = theme.scheduleTime.match(/(\d+)日/)
        if (dayMatch) {
          monthlyDay = parseInt(dayMatch[1])
        }
      }
    }
  }

  formData.value = {
    reportName: theme.name,
    keywordsInput: theme.keywords.join(','),
    reportTheme: theme.reportTheme,
    reportType: theme.reportType,
    scheduleType,
    dailyTime,
    weeklyDay,
    weeklyTime,
    monthlyDay,
    monthlyTime
  }

  showDialog.value = true
}

// 删除
const handleDeleteTheme = (theme) => {
  ElMessageBox.confirm(`确定要删除"${theme.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    themeList.value = themeList.value.filter(t => t.id !== theme.id)
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交
const handleSubmit = () => {
  if (!formData.value.reportName) {
    ElMessage.warning('请输入报告名称')
    return
  }
  if (!formData.value.keywordsInput) {
    ElMessage.warning('请输入监测词组')
    return
  }
  if (!formData.value.reportTheme) {
    ElMessage.warning('请选择报告主题类型')
    return
  }

  const keywords = formData.value.keywordsInput.split(',').map(k => k.trim()).filter(k => k)
  const scheduleTime = getScheduleTime()

  if (isEditMode.value) {
    // 编辑模式
    const index = themeList.value.findIndex(t => t.id === editingId.value)
    if (index !== -1) {
      themeList.value[index] = {
        id: editingId.value,
        name: formData.value.reportName,
        keywords,
        reportTheme: formData.value.reportTheme,
        reportType: formData.value.reportType,
        scheduleTime
      }
    }
    ElMessage.success('修改成功')
  } else {
    // 新增模式
    const newId = Math.max(...themeList.value.map(t => t.id)) + 1
    themeList.value.push({
      id: newId,
      name: formData.value.reportName,
      keywords,
      reportTheme: formData.value.reportTheme,
      reportType: formData.value.reportType,
      scheduleTime
    })
    ElMessage.success('新增成功')
  }

  showDialog.value = false
}
</script>

<style scoped>
.opinion-report-setting {
  background: white;
  padding: 20px;
  border-radius: 4px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 15px 0;
  color: #333;
}

.theme-section {
  margin-bottom: 30px;
}

.theme-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.theme-card {
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.theme-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.theme-actions {
  display: flex;
  gap: 5px;
}

.theme-keywords {
  margin-bottom: 10px;
}

.theme-config {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #606266;
}

.config-item {
  display: flex;
  align-items: center;
}

.add-section {
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.schedule-config {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.weekly-config,
.monthly-config {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>