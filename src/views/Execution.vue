<template>
  <div class="execution-container">
    <h2>执行管理</h2>
    <div class="search-area">
      <el-input v-model="searchKey" placeholder="搜索执行记录" style="width: 300px; margin-right: 10px;"></el-input>
      <el-button type="primary" @click="search">搜索</el-button>
    </div>
    <el-table :data="executionList" style="width: 100%">
      <el-table-column prop="id" label="执行ID" width="100"></el-table-column>
      <el-table-column prop="taskId" label="任务ID" width="100"></el-table-column>
      <el-table-column prop="taskName" label="任务名称" min-width="150"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 'success'" type="success">成功</el-tag>
          <el-tag v-else-if="scope.row.status === 'failed'" type="danger">失败</el-tag>
          <el-tag v-else type="info">运行中</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
      <el-table-column prop="duration" label="耗时(ms)" width="100"></el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button size="small" @click="viewLog(scope.row)">查看日志</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchKey = ref('')
const executionList = ref([])

const search = () => {
  console.log('Search execution:', searchKey.value)
}

const viewLog = (row) => {
  console.log('View log:', row)
}
</script>

<style scoped>
.execution-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-area {
  margin-bottom: 20px;
}
</style>