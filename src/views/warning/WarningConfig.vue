<template>
  <div class="warning-config">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input v-model="filterParams.alertName" placeholder="专题名称" style="width: 200px;" clearable />
      <el-input v-model="filterParams.keyWord" placeholder="预警词" style="width: 200px;" clearable />
      <el-select v-model="filterParams.alertLevel" placeholder="预警等级" style="width: 150px;" clearable>
        <el-option label="一级" value="1" />
        <el-option label="二级" value="2" />
        <el-option label="三级" value="3" />
      </el-select>
      <el-select v-model="filterParams.targetSource" placeholder="预警来源" style="width: 150px;" clearable>
        <el-option label="新华网" value="xinhuanet" />
        <el-option label="综合" value="integration" />
      </el-select>
      <el-select v-model="filterParams.triggerState" placeholder="状态" style="width: 150px;" clearable>
        <el-option label="已停止" value="0" />
        <el-option label="已启用" value="1" />
      </el-select>
      <el-button type="primary" @click="fetchData">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">新增预警</el-button>
      <el-button disabled>删除</el-button>
    </div>

    <!-- 配置列表 -->
    <div class="config-table">
      <el-table :data="configList" stripe style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="alertName" label="预警专题" min-width="120" />
        <el-table-column prop="keyWord" label="预警词" min-width="150">
          <template #default="scope">
            <template v-if="scope.row.keyWordGroups && scope.row.keyWordGroups.length > 0">
              <el-tag
                v-for="(group, index) in scope.row.keyWordGroups.slice(0, 3)"
                :key="index"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ Array.isArray(group) ? group.join(', ') : group }}
              </el-tag>
              <span v-if="scope.row.keyWordGroups.length > 3" style="color: #999;">...</span>
            </template>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="alertTrigger" label="预警等级" width="100">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.alertLevel)">
              {{ getLevelText(scope.row.alertLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetSource" label="预警来源" width="120">
          <template #default="scope">
            {{ getSourceText(scope.row.targetSource) }}
          </template>
        </el-table-column>
        <el-table-column prop="timeRangeText" label="预警时间" width="200" />
        <el-table-column prop="alertMethod" label="预警方式" width="120">
          <template #default="scope">
            {{ getAlertMethodText(scope.row.alertMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="triggerState" label="状态" width="100">
          <template #default="scope">
            <el-button
              :type="scope.row.triggerState === 1 ? 'success' : 'info'"
              size="small"
              @click="handleToggleState(scope.row)"
            >
              {{ scope.row.triggerState === 1 ? '启用中' : '已停止' }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="操作人" width="100">
          <template #default="scope">
            {{ scope.row.userName }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="上次执行时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.lastTriggerTime) }}
          </template>
        </el-table-column>
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
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAlertListAPI, toggleAlertStateAPI, deleteAlertAPI } from '@/api'

const router = useRouter()

const filterParams = ref({
  alertName: '',
  keyWord: '',
  alertLevel: '',
  targetSource: '',
  triggerState: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const selectedRows = ref([])
const configList = ref([])

// 下划线转驼峰
const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// 转换对象键名为驼峰
const convertKeysToCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item))
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = toCamelCase(key)
      result[camelKey] = convertKeysToCamelCase(obj[key])
      return result
    }, {})
  }
  return obj
}

// 格式化时间范围，包含星期几
const formatTimeRange = (timeRange) => {
  if (!timeRange) return '全天'

  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  // 检查是否全天全周
  if (timeRange.weekdays && Array.isArray(timeRange.weekdays)) {
    const isAllDay = timeRange.weekdays.every(day => day === 1) &&
                    timeRange.time?.start === '0:00' &&
                    timeRange.time?.end === '23:59'

    if (isAllDay) {
      return '全天'
    }

    // 获取选中的星期几
    const selectedWeekdays = timeRange.weekdays
      .map((val, index) => val === 1 ? weekdayNames[index] : null)
      .filter(day => day !== null)

    // 格式化时间
    const timeText = timeRange.time ?
      `${timeRange.time.start}-${timeRange.time.end}` : '全天'

    // 如果选中了所有星期，只显示时间
    if (selectedWeekdays.length === 7) {
      return timeText
    }

    // 显示星期几和时间
    return `${selectedWeekdays.join('、')} ${timeText}`
  }

  // 兜底：只有时间
  return timeRange.time ?
    `${timeRange.time.start}-${timeRange.time.end}` : '全天'
}

// 获取预警专题列表
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    if (filterParams.value.alertName) params.alertName = filterParams.value.alertName
    if (filterParams.value.keyWord) params.keyWord = filterParams.value.keyWord
    if (filterParams.value.alertLevel) params.alertLevel = parseInt(filterParams.value.alertLevel)
    if (filterParams.value.targetSource) params.targetSource = filterParams.value.targetSource
    if (filterParams.value.triggerState !== '') params.triggerState = parseInt(filterParams.value.triggerState)

    const response = await getAlertListAPI(params)

    if (response.code === 1) {
      const data = convertKeysToCamelCase(response.data)
      // 处理返回的数据
      const alertList = data.alertInfo || []
      configList.value = alertList.map(item => ({
        ...item,
        // 提取 keyWord 中的 keywordGroups
        keyWordGroups: item.keyWord?.keywordGroups || [],
        // 格式化时间范围，包含星期几
        timeRangeText: formatTimeRange(item.timeRange),
        // 格式化创建时间
        createTime: item.createTime || item.lastTriggerTime || '-'
      }))
      total.value = alertList.length
    } else {
      ElMessage.error(response.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('网络异常，请重试')
  } finally {
    loading.value = false
  }
}


const handleReset = () => {
  filterParams.value = {
    alertName: '',
    keyWord: '',
    alertLevel: '',
    targetSource: '',
    triggerState: ''
  }
  currentPage.value = 1
  fetchData()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  router.push('/warning/add')
}

const handleEdit = (row) => {
  // 跳转到新增页面，只传递 alertId
  router.push({
    path: '/warning/add',
    query: { alertId: row.alertId, mode: 'edit' }
  })
}

// 切换预警状态
const handleToggleState = async (row) => {
  const actionText = row.triggerState === 1 ? '停止' : '启用'

  try {
    const confirmed = await ElMessageBox.confirm(
      `确定要${actionText}该预警专题吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (confirmed) {
      const response = await toggleAlertStateAPI(row.alertId)

      if (response.code === 1) {
        ElMessage.success(`${actionText}成功`)
        // 刷新列表
        fetchData()
      } else {
        ElMessage.error(response.msg || `${actionText}失败`)
      }
    }
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('切换状态失败:', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条预警配置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用删除 API
    const response = await deleteAlertAPI(row.alertId)

    if (response.code === 1) {
      ElMessage.success('删除成功')
      // 刷新列表
      fetchData()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

const getLevelType = (level) => {
  const typeMap = {
    '1': 'danger',
    '2': 'warning',
    '3': 'info',
    1: 'danger',
    2: 'warning',
    3: 'info'
  }
  return typeMap[level] || 'info'
}

const getLevelText = (level) => {
  const textMap = {
    '1': '一级',
    '2': '二级',
    '3': '三级',
    1: '一级',
    2: '二级',
    3: '三级'
  }
  return textMap[level] || '-'
}

const getSourceText = (source) => {
  const sourceMap = {
    'xinhuanet': '新华网',
    'integration': '综合'
  }
  return sourceMap[source] || source || '-'
}

const getAlertMethodText = (method) => {
  if (method === null || method === undefined) return '-'
  const methodMap = {
    0: '系统通知',
    1: '邮件',
    2: '短信',
    3: '邮件+短信'
  }
  return methodMap[method] || '-'
}

const formatTime = (time) => {
  if (time === null) return '-'
  if (!time) return '-'
  if (typeof time === 'string') {
    // 处理 ISO 格式时间
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
  }
  return time
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.warning-config {
  padding: 20px;
  background: #fff;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.action-bar {
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
