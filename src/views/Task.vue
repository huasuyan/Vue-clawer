<template>
  <div class="task-container">
    <!-- 查询栏 -->
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
          <el-button @click="handleReset">查看</el-button>
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
      <el-table-column prop="execMethod" label="执行方式" width="100"></el-table-column>
      <el-table-column prop="configMethod" label="配置方式" width="100"></el-table-column>
      <el-table-column prop="lastExecTime" label="上次执行时间" width="160"></el-table-column>
      <el-table-column prop="nextExecTime" label="下次执行时间" width="160"></el-table-column>
      <el-table-column prop="description" label="爬虫描述" min-width="100"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="160"></el-table-column>
      <el-table-column label="启用状态" width="100" align="center">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" @change="toggleStatus(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="configFlow(scope.row)">配置流程</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCrawlerListAPI } from '@/api'

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

// 解析 cron 表达式
const parseCron = (cron) => {
  if (!cron) return ''

  const parts = cron.trim().split(/\s+/)
  if (parts.length < 5) return ''

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  let desc = '描述: '

  // 分钟
  if (minute === '*') {
    desc += '每分钟'
  } else if (minute.includes('/')) {
    const interval = minute.split('/')[1]
    desc += `每${interval}分钟`
  } else if (minute.includes(',')) {
    desc += `在第${minute.replace(/,/g, '、')}分钟`
  } else {
    desc += `在第${minute}分钟`
  }

  // 小时
  if (hour === '*') {
    desc += ', 每小时'
  } else if (hour.includes('/')) {
    const interval = hour.split('/')[1]
    desc += `, 每${interval}小时`
  } else if (hour.includes(',')) {
    desc += `, 在${hour.replace(/,/g, '、')}点`
  } else {
    desc += `, 在${hour}点`
  }

  // 日期
  if (dayOfMonth === '*') {
    // 不添加描述
  } else if (dayOfMonth.includes('/')) {
    const interval = dayOfMonth.split('/')[1]
    desc += `, 每隔${interval}天`
  } else if (dayOfMonth.includes(',')) {
    desc += `, 在${dayOfMonth.replace(/,/g, '、')}号`
  } else {
    desc += `, 在${dayOfMonth}号`
  }

  // 月份
  if (month !== '*') {
    if (month.includes(',')) {
      desc += `, 在${month.replace(/,/g, '、')}月`
    } else {
      desc += `, 在${month}月`
    }
  }

  // 星期
  if (dayOfWeek !== '*' && dayOfWeek !== '?') {
    const weekMap = { '0': '日', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '日' }
    if (dayOfWeek.includes(',')) {
      const days = dayOfWeek.split(',').map(d => '周' + (weekMap[d] || d)).join('、')
      desc += `, 在${days}`
    } else {
      desc += `, 在周${weekMap[dayOfWeek] || dayOfWeek}`
    }
  }

  return desc
}

// 加载数据
const loadData = async () => {
  try {
    const params = {
      pageNum: queryForm.value.pageNum,
      pageSize: queryForm.value.pageSize,
      crawlerName: queryForm.value.crawlerName || undefined,
      scheduleType: queryForm.value.scheduleType || undefined,
      configMethod: queryForm.value.configMethod || undefined,
      triggerStatus: queryForm.value.triggerStatus !== '' ? queryForm.value.triggerStatus : undefined
    }

    const res = await getCrawlerListAPI(params)

    if (res.code === 1) {
      taskList.value = res.data.map(item => ({
        id: item.crawlerId,
        name: item.crawlerName,
        cron: item.schedule_conf,
        cronDesc: parseCron(item.schedule_conf),
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
  ElMessage.info('新增任务功能开发中')
}

// 配置流程
const configFlow = (row) => {
  ElMessage.info(`配置流程: ${row.name}`)
}

// 编辑任务
const editTask = (row) => {
  ElMessage.info(`编辑任务: ${row.name}`)
}

// 删除任务
const deleteTask = (row) => {
  ElMessageBox.confirm(`确定删除任务"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 切换启用状态
const toggleStatus = (row) => {
  const status = row.enabled ? '启用' : '禁用'
  ElMessage.success(`已${status}任务: ${row.name}`)
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