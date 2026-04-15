<template>
  <div class="task-container">
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
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
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
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 任务列表
const taskList = ref([
  {
    id: 1,
    name: '任务调度',
    cron: '0 0 */5 * *',
    cronDesc: '描述: 在上午 12:00, 每隔 6 天',
    nextTime: '2023年10月1日星期三 00:00',
    execMethod: '定时任务',
    configMethod: '流程组件',
    lastExecTime: '2026-02-25 14:54:35',
    nextExecTime: '2026-02-25 14:54:35',
    description: '描述 XXXX',
    updateTime: '2026-02-25 14:54:35',
    enabled: true
  },
  {
    id: 2,
    name: '服务监控',
    cron: '0 2 * * *',
    cronDesc: '描述: 每天凌晨2点执行',
    nextTime: '2023年10月2日星期四 02:00',
    execMethod: '手动执行',
    configMethod: '脚本',
    lastExecTime: '2026-02-25 14:54:35',
    nextExecTime: '2026-02-25 14:54:35',
    description: '描述 XXXX',
    updateTime: '2026-02-25 14:54:35',
    enabled: false
  }
])

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
  pageSize.value = val
  ElMessage.info(`每页 ${val} 条`)
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  ElMessage.info(`当前页: ${val}`)
}
</script>

<style scoped>
.task-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
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