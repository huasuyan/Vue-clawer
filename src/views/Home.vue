<template>
  <div class="home">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <span class="title">任务调度中心</span>
      </div>
      <div class="header-right">
        <span class="welcome">欢迎：{{ username }}</span>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="运行报表" name="report"></el-tab-pane>
        <el-tab-pane label="任务管理" name="task" />
        <el-tab-pane label="调度日志" name="log"></el-tab-pane>
        <el-tab-pane label="执行器管理" name="executor"></el-tab-pane>
        <el-tab-pane label="调度日志" name="schedule-log"></el-tab-pane>
        <el-tab-pane label="用户管理" name="user"></el-tab-pane>
      </el-tabs>

      <!-- 任务管理内容 -->
      <div v-if="activeTab === 'task'" class="task-content">
        <!-- 搜索区域 -->
        <el-form :inline="true" class="search-form">
          <el-form-item label="执行器">
            <el-select v-model="searchForm.executor" placeholder="请选择执行器">
              <el-option label="通用执行器Sample" value="sample"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态">
              <el-option label="全部" value="all"></el-option>
              <el-option label="运行中" value="running"></el-option>
              <el-option label="停止" value="stop"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="任务描述">
            <el-input v-model="searchForm.description" placeholder="请输入任务描述"></el-input>
          </el-form-item>
          <el-form-item label="JobHandler">
            <el-input v-model="searchForm.jobHandler" placeholder="请输入JobHandler"></el-input>
          </el-form-item>
          <el-form-item label="负责人">
            <el-input v-model="searchForm.owner" placeholder="请输入负责人"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="search">查询</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" size="small" @click="openAddTaskDialog">新增</el-button>
          <el-button type="success" size="small">启动</el-button>
          <el-button type="warning" size="small">暂停</el-button>
          <el-button type="info" size="small">执行一次</el-button>
          <el-button size="small">删除日志</el-button>
          <el-button size="small">任务节点</el-button>
          <el-button size="small">下载执行器</el-button>
        </div>

        <!-- 任务列表 -->
        <el-table :data="taskList" style="width: 100%">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="任务ID" width="80"></el-table-column>
          <el-table-column prop="description" label="任务描述"></el-table-column>
          <el-table-column prop="cron" label="调度类型"></el-table-column>
          <el-table-column prop="jobHandler" label="运行模式"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 'stop'" type="danger">STOP</el-tag>
              <el-tag v-else type="success">RUNNING</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="负责人" width="100"></el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <span class="total">总计 1 条记录</span>
          <el-pagination
            layout="prev, pager, next"
            :total="1"
            :page-size="10"
            :current-page="1"
          ></el-pagination>
        </div>
      </div>
    </div>

    <!-- 新增任务模态框 -->
    <el-dialog
      v-model="addTaskDialogVisible"
      title="新增任务"
      width="900px"
    >
      <el-form :model="addTaskForm" label-width="80px">
        <!-- 基础配置 -->
        <div class="form-section">
          <h4>基础配置</h4>
          <div class="form-row">
            <el-form-item label="执行器">
              <template #label>
                执行器<span class="required">*</span>
              </template>
              <el-select v-model="addTaskForm.executor" placeholder="请选择执行器">
                <el-option label="通用执行器Sample" value="sample"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="任务描述">
              <template #label>
                任务描述<span class="required">*</span>
              </template>
              <el-input v-model="addTaskForm.description" placeholder="请输入任务描述"></el-input>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="负责人">
              <template #label>
                负责人<span class="required">*</span>
              </template>
              <el-input v-model="addTaskForm.owner" placeholder="请输入负责人"></el-input>
            </el-form-item>
            <el-form-item label="报警邮件">
              <el-input v-model="addTaskForm.email" placeholder="请输入报警邮件，多个邮件地址则逗号分隔"></el-input>
            </el-form-item>
          </div>
        </div>

        <!-- 调度配置 -->
        <div class="form-section">
          <h4>调度配置</h4>
          <div class="form-row">
            <el-form-item label="调度类型">
              <template #label>
                调度类型<span class="required">*</span>
              </template>
              <el-select v-model="addTaskForm.scheduleType" placeholder="请选择调度类型">
                <el-option label="CRON" value="CRON"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Cron">
              <template #label>
                Cron<span class="required">*</span>
              </template>
              <div class="cron-input">
                <el-input v-model="addTaskForm.cron" placeholder="cron表达式..."></el-input>
                <el-button size="small">编辑</el-button>
              </div>
            </el-form-item>
          </div>
        </div>

        <!-- 任务配置 -->
        <div class="form-section">
          <h4>任务配置</h4>
          <div class="form-row">
            <el-form-item label="运行模式">
              <template #label>
                运行模式<span class="required">*</span>
              </template>
              <el-select v-model="addTaskForm.runMode" placeholder="请选择运行模式">
                <el-option label="BEAN" value="BEAN"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="JobHandler">
              <template #label>
                JobHandler<span class="required">*</span>
              </template>
              <el-input v-model="addTaskForm.jobHandler" placeholder="请输入JobHandler"></el-input>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="任务参数">
              <el-input v-model="addTaskForm.params" placeholder="请输入任务参数" type="textarea" :rows="3"></el-input>
            </el-form-item>
          </div>
        </div>

        <!-- 高级配置 -->
        <div class="form-section">
          <h4>高级配置</h4>
          <div class="form-row">
            <el-form-item label="路由策略*">
              <el-select v-model="addTaskForm.routeStrategy" placeholder="请选择路由策略">
                <el-option label="第一个" value="FIRST"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="子任务ID*">
              <el-input v-model="addTaskForm.subTaskId" placeholder="请输入子任务的任务ID,如存在多个则逗号分隔"></el-input>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="调度过期策略*", width="160px">
              <el-select v-model="addTaskForm.expireStrategy" placeholder="请选择调度过期策略">
                <el-option label="忽略" value="IGNORE"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="阻塞处理策略*">
              <el-select v-model="addTaskForm.blockStrategy" placeholder="请选择阻塞处理策略">
                <el-option label="单机串行" value="SERIAL_EXECUTION"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="任务超时时间*">
              <el-input v-model="addTaskForm.timeout" placeholder="任务超时时间，单位秒，大于零时生效"></el-input>
            </el-form-item>
            <el-form-item label="失败重试次数*">
              <el-input v-model="addTaskForm.retryCount" placeholder="失败重试次数，大于零时生效"></el-input>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addTaskDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTask">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 当前用户名（模拟数据）
const username = ref('N170777') 

// 激活的标签页
const activeTab = ref('task')

// 搜索表单
const searchForm = ref({
  executor: 'sample',
  status: 'all',
  description: '',
  jobHandler: '',
  owner: ''
})

// 任务列表数据（模拟数据）
const taskList = ref([
  {
    id: 1,
    description: '示例任务01',
    cron: 'CRON: 0 0 * * * ?',
    jobHandler: 'BEAN: demoJobHandler',
    status: 'stop',
    owner: 'XXL'
  }
])

// 新增任务模态框可见性
const addTaskDialogVisible = ref(false)

// 新增任务表单数据
const addTaskForm = ref({
  executor: 'sample',
  description: '',
  owner: '',
  email: '',
  scheduleType: 'CRON',
  cron: '',
  runMode: 'BEAN',
  jobHandler: '',
  params: '',
  routeStrategy: 'FIRST',
  subTaskId: '',
  expireStrategy: 'IGNORE',
  blockStrategy: 'SERIAL_EXECUTION',
  timeout: '',
  retryCount: ''
})

// 搜索方法
const search = () => {
  console.log('搜索条件:', searchForm.value)
  // 这里可以添加实际的搜索逻辑
}

// 重置方法
const reset = () => {
  searchForm.value = {
    executor: 'sample',
    status: 'all',
    description: '',
    jobHandler: '',
    owner: ''
  }
}

// 打开新增任务模态框
const openAddTaskDialog = () => {
  // 重置表单数据
  addTaskForm.value = {
    executor: 'sample',
    description: '',
    owner: '',
    email: '',
    scheduleType: 'CRON',
    cron: '',
    runMode: 'BEAN',
    jobHandler: '',
    params: '',
    routeStrategy: 'FIRST',
    subTaskId: '',
    expireStrategy: 'IGNORE',
    blockStrategy: 'SERIAL_EXECUTION',
    timeout: '',
    retryCount: ''
  }
  // 显示模态框
  addTaskDialogVisible.value = true
}

// 保存任务
const saveTask = () => {
  console.log('保存任务:', addTaskForm.value)
  // 这里可以添加实际的保存逻辑
  // 模拟保存成功
  ElMessage.success('任务保存成功')
  // 关闭模态框
  addTaskDialogVisible.value = false
}
</script>

<style scoped>
.home {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #1890ff;
  color: white;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.tabs {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total {
  font-size: 14px;
  color: #606266;
}

/* 新增任务表单样式 */
.form-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.form-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  align-items: flex-end;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
  min-width: 200px;
}

.form-row .el-form-item__label {
  white-space: nowrap;

  font-weight: normal;
}

.form-row .el-form-item__label::after {
  content: '';
  margin-left: 4px;
}

.form-row .el-form-item__label:contains('*')::after {
  content: '*';
  color: #ff0000;
}

.form-row .el-form-item__content {
  flex: 1;
}

.cron-input {
  display: flex;
  gap: 10px;
}

.cron-input .el-input {
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>