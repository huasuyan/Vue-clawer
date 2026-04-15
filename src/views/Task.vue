<template>
  <div class="task-container">
    <!-- 顶部导航 -->
    <div class="task-nav">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="执行" name="execution"></el-tab-pane>
        <el-tab-pane label="测试测试" name="test"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-select v-model="form.region" placeholder="全部" style="width: 120px; margin-right: 10px;">
        <el-option label="全部" value="all"></el-option>
      </el-select>
      <el-input v-model="form.taskName" placeholder="请输入任务描述" style="width: 200px; margin-right: 10px;"></el-input>
      <el-input v-model="form.jobHandler" placeholder="请输入JobHandler" style="width: 200px; margin-right: 10px;"></el-input>
      <el-input v-model="form.owner" placeholder="请输入负责人" style="width: 150px; margin-right: 10px;"></el-input>
      <el-button type="primary" @click="search">搜索</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" size="small">+ 新增</el-button>
      <el-button size="small">编辑</el-button>
      <el-button size="small">CURL测试</el-button>
      <el-button size="small">删除任务</el-button>
      <el-button size="small">启动</el-button>
      <el-button size="small">停止</el-button>
      <el-button size="small">执行一次</el-button>
      <el-button size="small">查看日志</el-button>
      <el-button size="small">立即终止</el-button>
      <el-button size="small">下次执行时间</el-button>
    </div>

    <!-- 任务列表 -->
    <el-table :data="taskList" style="width: 100%">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="任务ID" width="80"></el-table-column>
      <el-table-column prop="name" label="任务描述" min-width="150"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 'running'" type="success">运行中</el-tag>
          <el-tag v-else type="info">停止</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cron" label="执行表达式" width="150"></el-table-column>
      <el-table-column prop="jobHandler" label="JobHandler" min-width="150"></el-table-column>
      <el-table-column prop="mode" label="调度模式" width="100"></el-table-column>
      <el-table-column prop="owner" label="负责人" width="100"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button size="small" @click="editTask(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <div v-if="taskList.length === 0" class="empty-state">
      <p>没有找到匹配的记录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 标签页
const activeTab = ref('execution')

// 搜索表单
const form = reactive({
  region: 'all',
  taskName: '',
  jobHandler: '',
  owner: ''
})

// 任务列表
const taskList = ref([])

// 处理标签页点击
const handleTabClick = (tab) => {
  console.log('Tab clicked:', tab.props.name)
}

// 搜索
const search = () => {
  console.log('Search:', form)
  // 模拟搜索结果
  taskList.value = []
}

// 重置
const reset = () => {
  form.region = 'all'
  form.taskName = ''
  form.jobHandler = ''
  form.owner = ''
  taskList.value = []
}

// 编辑任务
const editTask = (row) => {
  console.log('Edit task:', row)
}
</script>

<style scoped>
.task-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.task-nav {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.action-buttons {
  margin-bottom: 20px;
}

.action-buttons .el-button {
  margin-right: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}
</style>