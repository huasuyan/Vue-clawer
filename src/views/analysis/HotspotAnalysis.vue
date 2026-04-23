<template>
  <div class="hotspot-analysis">
    <div class="sidebar">
      <div class="sidebar-title">热点榜单</div>
      <div 
        class="sidebar-item" 
        :class="{ active: activeTab === 'event' }"
        @click="activeTab = 'event'"
      >
        热点事件
      </div>
      <div 
        class="sidebar-item" 
        :class="{ active: activeTab === 'person' }"
        @click="activeTab = 'person'"
      >
        热点人物
      </div>
    </div>

    <div class="content">
      <!-- 热点事件列表 -->
      <div v-if="activeTab === 'event'" class="card-list">
        <div v-for="item in eventList" :key="item.id" class="event-card">
          <img :src="item.image" alt="" class="event-image" />
          <div class="event-info">
            <div class="event-title">{{ item.title }}</div>
            <div class="event-desc">{{ item.description }}</div>
            <div class="event-stats">
              <span class="stat-label">咨询标数</span>
              <span class="stat-value">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 热点人物列表 -->
      <div v-if="activeTab === 'person'" class="card-list">
        <div v-for="item in personList" :key="item.id" class="person-card">
          <img :src="item.avatar" alt="" class="person-avatar" />
          <div class="person-info">
            <div class="person-name">{{ item.name }}</div>
            <div class="person-desc">{{ item.description }}</div>
            <div class="person-stats">
              <span class="stat-label">咨询标数</span>
              <span class="stat-value">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('event')

// 模拟热点事件数据
const eventList = ref([
  {
    id: 1,
    title: '淘宝买到假茅台官方拒绝10倍赔偿',
    description: '近期因门禁件：为宝宝剃板寸后官方拒绝10倍赔偿',
    image: 'https://via.placeholder.com/120x120/f5f5f5/999?text=茅台',
    count: 763723
  },
  {
    id: 2,
    title: '热点事件标题2',
    description: '事件描述内容2',
    image: 'https://via.placeholder.com/120x120/f5f5f5/999?text=事件2',
    count: 723723
  },
  {
    id: 3,
    title: '热点事件标题3',
    description: '事件描述内容3',
    image: 'https://via.placeholder.com/120x120/f5f5f5/999?text=事件3',
    count: 623723
  },
  {
    id: 4,
    title: '热点事件标题4',
    description: '事件描述内容4',
    image: 'https://via.placeholder.com/120x120/f5f5f5/999?text=事件4',
    count: 523723
  },
  {
    id: 5,
    title: '热点事件标题5',
    description: '事件描述内容5',
    image: 'https://via.placeholder.com/120x120/f5f5f5/999?text=事件5',
    count: 423723
  }
])

// 模拟热点人物数据
const personList = ref([
  {
    id: 1,
    name: '汪先生',
    description: '近期因门禁件：为宝宝剃板寸后官方拒绝10倍赔偿',
    avatar: 'https://via.placeholder.com/80x80/667eea/fff?text=汪',
    count: 763723
  },
  {
    id: 2,
    name: '黄先生',
    description: '相关事件描述内容',
    avatar: 'https://via.placeholder.com/80x80/764ba2/fff?text=黄',
    count: 723723
  },
  {
    id: 3,
    name: '姜先生',
    description: '相关事件描述内容',
    avatar: 'https://via.placeholder.com/80x80/f093fb/fff?text=姜',
    count: 623723
  },
  {
    id: 4,
    name: '李先生',
    description: '相关事件描述内容',
    avatar: 'https://via.placeholder.com/80x80/4facfe/fff?text=李',
    count: 523723
  },
  {
    id: 5,
    name: '王女士',
    description: '相关事件描述内容',
    avatar: 'https://via.placeholder.com/80x80/00f2fe/fff?text=王',
    count: 423723
  }
])
</script>

<style scoped>
.hotspot-analysis {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #fafafa;
  border-right: 1px solid #e8e8e8;
  padding: 20px 0;
}

.sidebar-title {
  padding: 0 20px 15px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
}

.sidebar-item {
  padding: 15px 20px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.sidebar-item:hover {
  background: #f0f0f0;
  color: #667eea;
}

.sidebar-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
  color: #667eea;
  font-weight: 500;
  border-left: 3px solid #667eea;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* 热点事件卡片 */
.event-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 15px;
  transition: all 0.3s;
  cursor: pointer;
}

.event-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.event-image {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.event-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
  flex: 1;
}

.event-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

/* 热点人物卡片 */
.person-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 15px;
  transition: all 0.3s;
  cursor: pointer;
}

.person-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.person-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.person-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.person-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.person-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
  flex: 1;
}

.person-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}
</style>
