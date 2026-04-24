<template>
  <div class="warning-add">
    <div class="header">
      <h2>预警详情</h2>
    </div>

    <div class="content-wrapper">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <div
          class="nav-item"
          :class="{ active: activeSection === 'content' }"
          @click="scrollToSection('content')"
        >
          预警内容配置
        </div>
        <div
          class="nav-item"
          :class="{ active: activeSection === 'message' }"
          @click="scrollToSection('message')"
        >
          预警消息配置
        </div>
      </div>

      <!-- 右侧表单内容 -->
      <div class="form-container" ref="formContainer" @scroll="handleScroll">
        <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px" class="form">
          <!-- 预警内容配置 -->
          <div class="section" ref="contentSection">
            <h3 class="section-title">预警内容配置</h3>

            <el-form-item label="预警专题" prop="alertName" required>
              <el-input v-model="formData.alertName" placeholder="请输入预警专题" />
            </el-form-item>

            <el-form-item label="预警等级" prop="alertLevel" required>
              <el-select v-model="formData.alertLevel" placeholder="请选择预警等级" style="width: 100%">
                <el-option label="一级" value= 1 />
                <el-option label="二级" value= 2 />
                <el-option label="三级" value= 3 />
              </el-select>
            </el-form-item>

            <el-form-item label="预警词组" prop="keywordGroups" required>
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

            <el-form-item label="目标来源" prop="targetSource" required>
              <el-select v-model="formData.targetSource" placeholder="请选择目标来源" style="width: 100%">
                <el-option label="默认" value="default" />
              </el-select>
            </el-form-item>

            <!-- 目标来源参数配置 -->
            <el-form-item label="来源参数" v-if="formData.targetSource === 'default'">
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
          </div>

          <!-- 预警消息配置 -->
          <div class="section" ref="messageSection">
            <h3 class="section-title">预警消息配置</h3>

            <el-form-item label="预警密度" required>
              <div class="density-params">
                <div class="param-row">
                  <span class="param-label">定时参数：</span>
                  <el-input-number
                    v-model="formData.frequency"
                    :min="1"
                    :max="1440"
                    controls-position="right"
                    style="width: 150px;"
                  />
                  <span class="param-hint">分钟（每隔多少分钟执行一次）</span>
                </div>
                <div class="param-row">
                  <span class="param-label">定量参数：</span>
                  <el-input-number
                    v-model="formData.alertTrigger"
                    :min="0"
                    controls-position="right"
                    style="width: 150px;"
                  />
                  <span class="param-hint">预警阈值（0代表实时预警）</span>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="预警时间" required>
              <div class="time-range-config">
                <div class="param-row">
                  <el-switch
                    v-model="formData.enableTimeRange"
                    active-text="限制预警时间"
                    inactive-text="允许全天预警"
                  />
                </div>

                <template v-if="formData.enableTimeRange">
                  <div class="param-row">
                    <span class="param-label">预警星期：</span>
                    <el-checkbox-group v-model="formData.selectedWeekdays" class="weekdays-group">
                      <el-checkbox :label="0">周日</el-checkbox>
                      <el-checkbox :label="1">周一</el-checkbox>
                      <el-checkbox :label="2">周二</el-checkbox>
                      <el-checkbox :label="3">周三</el-checkbox>
                      <el-checkbox :label="4">周四</el-checkbox>
                      <el-checkbox :label="5">周五</el-checkbox>
                      <el-checkbox :label="6">周六</el-checkbox>
                    </el-checkbox-group>
                  </div>

                  <div class="param-row">
                    <span class="param-label">时间范围：</span>
                    <el-time-picker
                      v-model="formData.timeStart"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="开始时间"
                      style="width: 150px;"
                    />
                    <span style="margin: 0 10px;">至</span>
                    <el-time-picker
                      v-model="formData.timeEnd"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="结束时间"
                      style="width: 150px;"
                    />
                  </div>
                </template>
              </div>
            </el-form-item>

            <el-form-item label="预警方式" prop="alertMethod" required>
              <el-radio-group v-model="formData.alertMethod">
                <el-radio :label="0">全部</el-radio>
                <el-radio :label="1">站内信</el-radio>
                <el-radio :label="2">邮箱</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="预警人员">
              <div class="personnel-input-wrapper">
                <el-input
                  v-model="formData.alertPersonnel"
                  placeholder="请输入预警人员，多个人员用逗号分隔"
                  class="personnel-input"
                />
                <el-button type="primary" @click="handleSelectPersonnel" class="select-personnel-btn">
                  选择人员
                </el-button>
              </div>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>

    <div class="footer">
      <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
      <el-button @click="handleBack">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled, Plus } from '@element-plus/icons-vue'
import { createAlertAPI, editAlertAPI, getAlertByIdAPI } from '@/api'

const router = useRouter()
const route = useRoute()
const activeSection = ref('content')
const formRef = ref(null)
const submitting = ref(false)
const formContainer = ref(null)
const contentSection = ref(null)
const messageSection = ref(null)
const keywordInputRef = ref([])

// 判断是否为编辑模式
const isEditMode = ref(false)
const editId = ref(null)

const formData = reactive({
  alertName: '',
  alertLevel: '',
  keywordGroups: [
    { keywords: [], inputVisible: false, inputValue: '' }
  ],
  targetSource: '',
  sourceParams: {
    page: 1,
    sources: []
  },
  frequency: 1,
  alertTrigger: 0,
  enableTimeRange: false,
  selectedWeekdays: [],
  timeStart: '',
  timeEnd: '',
  alertMethod: 0,
  alertPersonnel: ''
})

const rules = {
  alertName: [{ required: true, message: '请输入预警专题', trigger: 'blur' }],
  alertLevel: [{ required: true, message: '请选择预警等级', trigger: 'change' }],
  keywordGroups: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        const hasKeywords = value.some(group => group.keywords && group.keywords.length > 0)
        if (!hasKeywords) {
          callback(new Error('请至少添加一个预警词组'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  targetSource: [{ required: true, message: '请选择目标来源', trigger: 'change' }],
  alertMethod: [{ required: true, message: '请选择预警方式', trigger: 'change' }]
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

const scrollToSection = (section) => {
  activeSection.value = section
  const targetSection = section === 'content' ? contentSection.value : messageSection.value
  if (targetSection && formContainer.value) {
    const offsetTop = targetSection.offsetTop - 20
    formContainer.value.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}

const handleScroll = () => {
  if (!formContainer.value || !contentSection.value || !messageSection.value) return

  const scrollTop = formContainer.value.scrollTop
  const contentTop = contentSection.value.offsetTop - 100
  const messageTop = messageSection.value.offsetTop - 100

  if (scrollTop >= messageTop) {
    activeSection.value = 'message'
  } else if (scrollTop >= contentTop) {
    activeSection.value = 'content'
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    submitting.value = true

    // 获取用户ID
    const userId = localStorage.getItem('userId') || ''

    // 构建符合要求的 keywordGroups JSON 格式
    const keywordGroupsData = formData.keywordGroups
      .filter(group => group.keywords && group.keywords.length > 0)
      .map(group => group.keywords)

    // 构建时间范围配置
    let timeRange = null
    if (formData.enableTimeRange) {
      // 构建 weekdays 数组 [0, 1, 1, 1, 1, 1, 0]
      const weekdays = [0, 0, 0, 0, 0, 0, 0]
      formData.selectedWeekdays.forEach(day => {
        weekdays[day] = 1
      })

      timeRange = {
        weekdays: weekdays,
        time: {
          start: formData.timeStart,
          end: formData.timeEnd
        }
      }
    }
    else{
      const weekdays = [1, 1, 1, 1, 1, 1, 1]

      timeRange = {
        weekdays: weekdays,
        time: {
          start: "0:00",
          end: "23:59"
        }
      }
    }

    // 构建目标来源
    const targetSource = formData.targetSource === 'default' ? 'integration' : formData.targetSource

    // 构建可变参数
    const params = formData.targetSource === 'default' ? {
      page: formData.sourceParams.page,
      source: formData.sourceParams.sources
    } : null

    // 构建 keyWord 对象
    const keyWordObj = {
      keywordGroups: keywordGroupsData
    }

    const submitData = {
      userId: userId,
      alertName: formData.alertName,
      alertLevel: formData.alertLevel,
      keyWord: JSON.stringify(keyWordObj),
      targetSource: targetSource,
      params: params ? JSON.stringify(params) : null,
      dedupEnable: 0,
      frequency: formData.frequency,
      alertTrigger: formData.alertTrigger,
      timeRange: JSON.stringify(timeRange),
      alertMethod: formData.alertMethod
    }

    console.log('提交数据:', JSON.stringify(submitData, null, 2))

    // 根据模式调用不同的 API
    let response
    if (isEditMode.value) {
      // 编辑模式：调用更新 API，需要添加 alertId
      response = await editAlertAPI({ ...submitData, alertId: editId.value })
    } else {
      // 新增模式：调用创建 API
      response = await createAlertAPI(submitData)
    }

    if (response.code === 1) {
      ElMessage.success(isEditMode.value ? '预警配置更新成功' : '预警配置创建成功')
      router.push('/warning/config')
    } else {
      ElMessage.error(response.msg || (isEditMode.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('请完善必填项或检查网络连接')
  } finally {
    submitting.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleSelectPersonnel = () => {
  ElMessage.info('选择人员功能开发中')
  // TODO: 打开人员选择对话框
}

// 初始化编辑数据
const initEditData = async () => {
  // 检查是否为编辑模式
  if (route.query.mode === 'edit' && route.query.alertId) {
    isEditMode.value = true
    editId.value = route.query.alertId

    try {
      // 调用 API 获取编辑数据
      const response = await getAlertByIdAPI(route.query.alertId)
      console.log('API 返回数据:', response)

      if (response.code === 1 && response.data) {
        const editData = response.data
        console.log('编辑数据:', editData)

        // 回填基本信息
        formData.alertName = editData.alertName || ''
        formData.alertLevel = editData.alertLevel || ''
        formData.targetSource = editData.targetSource === 'integration' ? 'default' : editData.targetSource
        formData.frequency = editData.frequency || 1
        formData.alertTrigger = editData.alertTrigger || 0
        formData.alertMethod = editData.alertMethod || 0
        formData.alertPersonnel = editData.alertPersonnel || ''

        // 解析 keyWord - 可能是字符串或对象
        try {
          let keyWordObj = editData.keyWord
          if (typeof keyWordObj === 'string') {
            keyWordObj = JSON.parse(keyWordObj)
          }
          console.log('keyWordObj:', keyWordObj)

          if (keyWordObj && keyWordObj.keywordGroups && Array.isArray(keyWordObj.keywordGroups)) {
            formData.keywordGroups = keyWordObj.keywordGroups.map(keywords => ({
              keywords: Array.isArray(keywords) ? keywords : [],
              inputVisible: false,
              inputValue: ''
            }))
          }
        } catch (e) {
          console.error('解析 keyWord 失败:', e)
        }

        // 解析 params - 可能是字符串或对象
        try {
          let paramsObj = editData.params
          if (typeof paramsObj === 'string') {
            paramsObj = JSON.parse(paramsObj)
          }
          console.log('paramsObj:', paramsObj)

          if (paramsObj) {
            if (paramsObj.page) {
              formData.sourceParams.page = paramsObj.page
            }
            if (paramsObj.source && Array.isArray(paramsObj.source)) {
              formData.sourceParams.sources = paramsObj.source
            }
          }
        } catch (e) {
          console.error('解析 params 失败:', e)
        }

        // 解析 timeRange - 可能是字符串或对象
        try {
          let timeRangeObj = editData.timeRange
          if (typeof timeRangeObj === 'string') {
            timeRangeObj = JSON.parse(timeRangeObj)
          }
          console.log('timeRangeObj:', timeRangeObj)

          if (timeRangeObj && timeRangeObj.weekdays && Array.isArray(timeRangeObj.weekdays)) {
            // 检查是否全天预警
            const isAllDay = timeRangeObj.weekdays.every(day => day === 1) &&
                            timeRangeObj.time?.start === '0:00' &&
                            timeRangeObj.time?.end === '23:59'

            formData.enableTimeRange = !isAllDay

            if (!isAllDay) {
              // 转换 weekdays 数组为选中的星期
              formData.selectedWeekdays = timeRangeObj.weekdays
                .map((val, index) => val === 1 ? index : -1)
                .filter(index => index !== -1)

              if (timeRangeObj.time) {
                formData.timeStart = timeRangeObj.time.start || ''
                formData.timeEnd = timeRangeObj.time.end || ''
              }
            }
          }
        } catch (e) {
          console.error('解析 timeRange 失败:', e)
        }

        console.log('回填后的表单数据:', formData)
      } else {
        ElMessage.error(response.msg || '获取预警数据失败')
        router.back()
      }
    } catch (error) {
      console.error('获取编辑数据失败:', error)
      ElMessage.error('获取预警数据失败')
      router.back()
    }
  }
}

// 组件挂载时初始化
onMounted(() => {
  initEditData()
})

</script>

<style scoped>
.warning-add {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #fafafa;
  border-radius: 8px;
  padding: 10px 0;
  flex-shrink: 0;
}

.nav-item {
  padding: 12px 20px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  background: #f0f0f0;
  color: #409eff;
}

.nav-item.active {
  color: #409eff;
  background: #ecf5ff;
  font-weight: 500;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #409eff;
  border-radius: 0 2px 2px 0;
}

.form-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.form {
  max-width: 800px;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.footer {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
  margin-top: 20px;
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
  border-style: dashed;
}

.source-params {
  width: 100%;
}

.param-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-label {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
  min-width: 80px;
}

.param-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

.density-params {
  width: 100%;
}

.param-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.param-row:last-child {
  margin-bottom: 0;
}

.time-range-config {
  width: 100%;
}

.weekdays-group {
  display: flex;
  gap: 10px;
}

.personnel-input-wrapper {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
}

.personnel-input {
  flex: 1;
}

.select-personnel-btn {
  flex-shrink: 0;
}
</style>
