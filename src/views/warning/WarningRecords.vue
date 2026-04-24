<template>
  <div class="warning-records">
    <!-- 上半部分：查询条件 -->
    <el-card class="search-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">选择预警专题</span>
        </div>
      </template>
      <div class="form-container">
        <el-form :inline="true" class="search-form">
          <el-form-item label="预警专题:">
            <el-select v-model="filterTopic" placeholder="请选择预警专题" style="width: 300px;">
              <el-option
                v-for="item in topicOptions"
                :key="item.alertId"
                :label="item.alertName"
                :value="item.alertId"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 下半部分：标签页展示 -->
    <el-card class="result-card" shadow="never">
      <el-tabs v-model="activeTab" class="result-tabs">
        <!-- 标签页1：信息列表 -->
        <el-tab-pane label="信息列表" name="list">
          <div class="result-header">
            共 {{ hasSearched ? total : 0 }} 条结果
          </div>

          <!-- 空状态 -->
          <div v-if="!hasSearched" class="empty-state">
            <el-empty description="暂无数据，请选择预警专题进行查询" />
          </div>

          <!-- 预警记录列表 (查询后显示) -->
          <div v-else>
            <div class="records-list">
              <div class="record-item" v-for="(item, index) in recordsList" :key="item.newsId || index">
                <div class="item-checkbox">
                  <el-checkbox v-model="item.selected" @change="handleSelectionChange"></el-checkbox>
                </div>
                <div class="item-main">
                  <!-- 标题与标签 -->
                  <div class="item-title-row">
                    <span class="item-title" v-html="highlightKeyword(item.title)"></span>
                    <div class="item-tags">
                      <el-tag size="small" type="primary" class="tag-item" v-if="item.originalUrl" effect="plain">原文</el-tag>
                      <el-tag size="small" type="info" class="tag-item" v-if="item.articleType" effect="plain">{{ item.articleType }}</el-tag>
                      <el-tag size="small" :type="getSensitivityType(item.sensitivityLevel)" class="tag-item" v-if="item.sensitivityLabel" effect="plain">
                        {{ item.sensitivityLabel }}
                      </el-tag>
                      <el-tag size="small" :type="getSentimentType(item.sentimentType)" class="tag-item" v-if="item.sentimentType !== undefined" effect="plain">
                        {{ getSentimentLabel(item.sentimentType) }}
                      </el-tag>
                      <el-tag size="small" type="primary" class="tag-item" v-if="item.region" effect="plain">{{ item.region }}</el-tag>
                    </div>
                  </div>

                  <!-- 摘要内容 -->
                  <div class="item-content" v-html="highlightKeyword(item.content || '暂无内容摘要')">
                  </div>

                  <!-- 底部信息与操作 -->
                  <div class="item-footer">
                    <div class="footer-meta">
                      <span v-if="item.source">来源：{{ item.source }}</span>
                      <span v-if="item.platform">平台：{{ item.platform }}</span>
                      <span v-if="item.publisher">发文账号：{{ item.publisher }}</span>
                      <span v-if="item.region">地域：{{ item.region }}</span>
                      <span v-if="item.publishTime">发文时间：{{ formatTime(item.publishTime) }}</span>
                      <span v-if="item.comment !== undefined">评论：{{ item.comment }}</span>
                    </div>
                    <div class="footer-center" v-if="item.similarCount !== undefined">
                      <el-button size="small" round>相似文章：{{ item.similarCount || 3 }}</el-button>
                    </div>
                    <div class="footer-actions">
                      <el-button link type="primary" @click="viewOriginal(item.originalUrl)">查看原文</el-button>
                      <el-button link type="primary" @click="copyLink(item.originalUrl)">复制链接</el-button>
                      <el-button link type="primary" @click="handleProcess(item)">转为办件</el-button>
                      <el-button link type="primary">溯源</el-button>
                      <el-button link type="primary" @click="handleDelete(item)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 标签页2：统计分析 -->
        <el-tab-pane label="统计分析" name="statistics">
          <div v-if="!hasSearched" class="empty-state">
            <el-empty description="暂无数据，请选择预警专题进行查询" />
          </div>
          <div v-else class="statistics-container">
            <!-- 统计卡片 -->
            <div class="stats-cards">
              <div class="stat-card card-blue">
                <div class="stat-label">文章总数</div>
                <div class="stat-value">{{ statisticsData.totalArticles }}</div>
              </div>
              <div class="stat-card card-purple">
                <div class="stat-label">敏感总数</div>
                <div class="stat-value">{{ statisticsData.sensitiveCount }}</div>
              </div>
              <div class="stat-card card-orange">
                <div class="stat-label">中性总数</div>
                <div class="stat-value">{{ statisticsData.neutralCount }}</div>
              </div>
              <div class="stat-card card-green">
                <div class="stat-label">非敏感总数</div>
                <div class="stat-value">{{ statisticsData.normalCount }}</div>
              </div>
            </div>

            <!-- 地域分布 -->
            <div class="region-analysis">
              <div class="region-map">
                <div class="section-title">地域分布热图</div>
                <div id="chinaMap" class="map-container"></div>
              </div>
              <div class="region-table">
                <div class="section-title">地域发布量排名</div>
                <el-table :data="regionRankData" style="width: 100%" max-height="500">
                  <el-table-column prop="rank" label="排名" width="80" align="center" />
                  <el-table-column prop="region" label="地域" width="120" />
                  <el-table-column prop="count" label="发文量" width="100" align="center" />
                  <el-table-column prop="sensitiveCount" label="敏感信息" align="center" />
                </el-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 处理对话框 -->
    <el-dialog v-model="showProcessDialog" title="处理预警" width="500px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-select v-model="processForm.result" placeholder="请选择处理结果">
            <el-option label="已处理" value="已处理" />
            <el-option label="误报" value="误报" />
            <el-option label="待跟进" value="待跟进" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input v-model="processForm.remark" type="textarea" :rows="4" placeholder="请输入处理说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProcessDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchAllAlertAPI, getAlertInfoListAPI, deleteAlertInfoAPI, getAlertStatisticsAPI } from '@/api/index'
import * as echarts from 'echarts'
import chinaJson from '@/assets/china.json'

const filterTopic = ref('')
const topicOptions = ref([])
const activeTab = ref('list')

// 统计数据
const statisticsData = ref({
  totalArticles: 0,
  sensitiveCount: 0,
  neutralCount: 0,
  normalCount: 0
})

// 地域排名数据
const regionRankData = ref([])

// 地域图表数据
const regionChartData = ref([])

// 地图实例
let mapChart = null

// 地级市到省份的映射表（注意：省份名称需要带"省"字，直辖市带"市"，自治区带完整名称）
const cityToProvinceMap = {
  // 直辖市（带"市"）
  '北京': '北京市', '北京市': '北京市',
  '上海': '上海市', '上海市': '上海市',
  '天津': '天津市', '天津市': '天津市',
  '重庆': '重庆市', '重庆市': '重庆市',

  // 河北省
  '石家庄': '河北省', '石家庄市': '河北省', '唐山': '河北省', '唐山市': '河北省',
  '秦皇岛': '河北省', '秦皇岛市': '河北省', '邯郸': '河北省', '邯郸市': '河北省',
  '邢台': '河北省', '邢台市': '河北省', '保定': '河北省', '保定市': '河北省',
  '张家口': '河北省', '张家口市': '河北省', '承德': '河北省', '承德市': '河北省',
  '沧州': '河北省', '沧州市': '河北省', '廊坊': '河北省', '廊坊市': '河北省',
  '衡水': '河北省', '衡水市': '河北省',

  // 山西省
  '太原': '山西省', '太原市': '山西省', '大同': '山西省', '大同市': '山西省',
  '阳泉': '山西省', '阳泉市': '山西省', '长治': '山西省', '长治市': '山西省',
  '晋城': '山西省', '晋城市': '山西省', '朔州': '山西省', '朔州市': '山西省',
  '晋中': '山西省', '晋中市': '山西省', '运城': '山西省', '运城市': '山西省',
  '忻州': '山西省', '忻州市': '山西省', '临汾': '山西省', '临汾市': '山西省',
  '吕梁': '山西省', '吕梁市': '山西省',

  // 内蒙古（自治区不带"省"）
  '呼和浩特': '内蒙古自治区', '呼和浩特市': '内蒙古自治区', '包头': '内蒙古自治区', '包头市': '内蒙古自治区',
  '乌海': '内蒙古自治区', '乌海市': '内蒙古自治区', '赤峰': '内蒙古自治区', '赤峰市': '内蒙古自治区',
  '通辽': '内蒙古自治区', '通辽市': '内蒙古自治区', '鄂尔多斯': '内蒙古自治区', '鄂尔多斯市': '内蒙古自治区',
  '呼伦贝尔': '内蒙古自治区', '呼伦贝尔市': '内蒙古自治区', '巴彦淖尔': '内蒙古自治区', '巴彦淖尔市': '内蒙古自治区',
  '乌兰察布': '内蒙古自治区', '乌兰察布市': '内蒙古自治区',

  // 辽宁省
  '沈阳': '辽宁省', '沈阳市': '辽宁省', '大连': '辽宁省', '大连市': '辽宁省',
  '鞍山': '辽宁省', '鞍山市': '辽宁省', '抚顺': '辽宁省', '抚顺市': '辽宁省',
  '本溪': '辽宁省', '本溪市': '辽宁省', '丹东': '辽宁省', '丹东市': '辽宁省',
  '锦州': '辽宁省', '锦州市': '辽宁省', '营口': '辽宁省', '营口市': '辽宁省',
  '阜新': '辽宁省', '阜新市': '辽宁省', '辽阳': '辽宁省', '辽阳市': '辽宁省',
  '盘锦': '辽宁省', '盘锦市': '辽宁省', '铁岭': '辽宁省', '铁岭市': '辽宁省',
  '朝阳': '辽宁省', '朝阳市': '辽宁省', '葫芦岛': '辽宁省', '葫芦岛市': '辽宁省',

  // 吉林省
  '长春': '吉林省', '长春市': '吉林省', '吉林': '吉林省', '吉林市': '吉林省',
  '四平': '吉林省', '四平市': '吉林省', '辽源': '吉林省', '辽源市': '吉林省',
  '通化': '吉林省', '通化市': '吉林省', '白山': '吉林省', '白山市': '吉林省',
  '松原': '吉林省', '松原市': '吉林省', '白城': '吉林省', '白城市': '吉林省',

  // 黑龙江省
  '哈尔滨': '黑龙江省', '哈尔滨市': '黑龙江省', '齐齐哈尔': '黑龙江省', '齐齐哈尔市': '黑龙江省',
  '鸡西': '黑龙江省', '鸡西市': '黑龙江省', '鹤岗': '黑龙江省', '鹤岗市': '黑龙江省',
  '双鸭山': '黑龙江省', '双鸭山市': '黑龙江省', '大庆': '黑龙江省', '大庆市': '黑龙江省',
  '伊春': '黑龙江省', '伊春市': '黑龙江省', '佳木斯': '黑龙江省', '佳木斯市': '黑龙江省',
  '七台河': '黑龙江省', '七台河市': '黑龙江省', '牡丹江': '黑龙江省', '牡丹江市': '黑龙江省',
  '黑河': '黑龙江省', '黑河市': '黑龙江省', '绥化': '黑龙江省', '绥化市': '黑龙江省',

  // 江苏省
  '南京': '江苏省', '南京市': '江苏省', '无锡': '江苏省', '无锡市': '江苏省',
  '徐州': '江苏省', '徐州市': '江苏省', '常州': '江苏省', '常州市': '江苏省',
  '苏州': '江苏省', '苏州市': '江苏省', '南通': '江苏省', '南通市': '江苏省',
  '连云港': '江苏省', '连云港市': '江苏省', '淮安': '江苏省', '淮安市': '江苏省',
  '盐城': '江苏省', '盐城市': '江苏省', '扬州': '江苏省', '扬州市': '江苏省',
  '镇江': '江苏省', '镇江市': '江苏省', '泰州': '江苏省', '泰州市': '江苏省',
  '宿迁': '江苏省', '宿迁市': '江苏省',

  // 浙江省
  '杭州': '浙江省', '杭州市': '浙江省', '宁波': '浙江省', '宁波市': '浙江省',
  '温州': '浙江省', '温州市': '浙江省', '嘉兴': '浙江省', '嘉兴市': '浙江省',
  '湖州': '浙江省', '湖州市': '浙江省', '绍兴': '浙江省', '绍兴市': '浙江省',
  '金华': '浙江省', '金华市': '浙江省', '衢州': '浙江省', '衢州市': '浙江省',
  '舟山': '浙江省', '舟山市': '浙江省', '台州': '浙江省', '台州市': '浙江省',
  '丽水': '浙江省', '丽水市': '浙江省',

  // 安徽省到海南省
  '合肥': '安徽省', '合肥市': '安徽省', '福州': '福建省', '福州市': '福建省',
  '南昌': '江西省', '南昌市': '江西省', '济南': '山东省', '济南市': '山东省',
  '青岛': '山东省', '青岛市': '山东省', '郑州': '河南省', '郑州市': '河南省',
  '武汉': '湖北省', '武汉市': '湖北省', '长沙': '湖南省', '长沙市': '湖南省',
  '广州': '广东省', '广州市': '广东省', '深圳': '广东省', '深圳市': '广东省',
  '南宁': '广西壮族自治区', '南宁市': '广西壮族自治区', '海口': '海南省', '海口市': '海南省',
  '成都': '四川省', '成都市': '四川省', '贵阳': '贵州省', '贵阳市': '贵州省',
  '昆明': '云南省', '昆明市': '云南省', '拉萨': '西藏自治区', '拉萨市': '西藏自治区',
  '西安': '陕西省', '西安市': '陕西省', '兰州': '甘肃省', '兰州市': '甘肃省',
  '西宁': '青海省', '西宁市': '青海省', '银川': '宁夏回族自治区', '银川市': '宁夏回族自治区',
  '乌鲁木齐': '新疆维吾尔自治区', '乌鲁木齐市': '新疆维吾尔自治区',

  // 特殊
  '全国': '全国', '中国': '全国', '全部': '全国'
}

const fetchTopics = async () => {
  try {
    const res = await searchAllAlertAPI()
    if (res.code === 1 && res.data && res.data.alertInfos) {
      topicOptions.value = res.data.alertInfos
    } else {
      ElMessage.error(res.msg || '获取预警专题数据失败')
    }
  } catch (error) {
    console.error('获取预警专题数据异常:', error)
    ElMessage.error('获取预警专题数据失败')
  }
}

onMounted(() => {
  fetchTopics()
})

const hasSearched = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref([])

const showProcessDialog = ref(false)
const processForm = ref({
  result: '',
  remark: ''
})

const recordsList = ref([])

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleFilter = async () => {
  if (!filterTopic.value) {
    ElMessage.warning('请选择预警专题')
    return
  }

  try {
    // 获取信息列表
    const res = await getAlertInfoListAPI({
      alertId: filterTopic.value,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })

    if (res.code === 1 && res.data) {
      recordsList.value = res.data.NewsDataList || []
      total.value = res.data.total || 0
      if (res.data.pageSize) {
        pageSize.value = res.data.pageSize
      }
      hasSearched.value = true

      // 获取统计数据
      await fetchStatistics()

      ElMessage.success('查询成功')
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询舆情信息异常:', error)
    ElMessage.error('查询舆情信息失败')
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    console.log('开始获取统计数据，预警专题ID:', filterTopic.value)
    const res = await getAlertStatisticsAPI(filterTopic.value)

    console.log('统计数据API返回:', res)

    if (res.code === 1 && res.data) {
      console.log('统计数据解析成功:', res.data)

      // 更新概览数据
      statisticsData.value = {
        totalArticles: res.data.totalArticle || 0,
        sensitiveCount: res.data.totalSensitive || 0,
        neutralCount: res.data.totalNeutral || 0,
        normalCount: res.data.totalNonSensitive || 0
      }
      console.log('概览数据已更新:', statisticsData.value)

      // 解析并更新地域排名数据（JSON字符串需要解析）
      if (res.data.regionRank) {
        try {
          const rankList = typeof res.data.regionRank === 'string'
            ? JSON.parse(res.data.regionRank)
            : res.data.regionRank

          regionRankData.value = rankList.map(item => ({
            rank: item.rank,
            region: item.region,
            count: item.publishCount,
            sensitiveCount: item.sensitiveCount
          }))
          console.log('地域排名数据已更新:', regionRankData.value)
        } catch (e) {
          console.error('解析regionRank失败:', e)
        }
      }

      // 解析并保存图表数据（JSON字符串需要解析）
      if (res.data.regionChart) {
        try {
          regionChartData.value = typeof res.data.regionChart === 'string'
            ? JSON.parse(res.data.regionChart)
            : res.data.regionChart
          console.log('图表数据已保存:', regionChartData.value)
        } catch (e) {
          console.error('解析regionChart失败:', e)
        }
      }

      // 初始化地图（如果在统计分析标签页）
      nextTick(() => {
        if (activeTab.value === 'statistics') {
          console.log('当前在统计分析标签页，初始化地图')
          initMap(regionChartData.value)
        } else {
          console.log('当前不在统计分析标签页，activeTab:', activeTab.value)
        }
      })
    } else {
      console.error('获取统计数据失败 - code:', res.code, 'message:', res.message || res.msg)
      ElMessage.warning('获取统计数据失败，请稍后重试')
    }
  } catch (error) {
    console.error('获取统计数据异常:', error)
    ElMessage.error('获取统计数据异常')
  }
}

// 初始化地图
const initMap = (regionChartData = []) => {
  console.log('=== initMap 被调用 ===')
  console.log('传入的 regionChartData:', regionChartData)
  console.log('regionChartData 类型:', typeof regionChartData, '是否为数组:', Array.isArray(regionChartData))
  console.log('regionChartData 长度:', regionChartData?.length)

  const mapDom = document.getElementById('chinaMap')
  if (!mapDom) {
    console.error('找不到地图DOM元素')
    return
  }

  if (mapChart) {
    mapChart.dispose()
  }

  mapChart = echarts.init(mapDom)

  // 注册中国地图
  echarts.registerMap('china', chinaJson)

  // 如果没有传入数据，使用排名数据
  const chartData = regionChartData.length > 0 ? regionChartData : regionRankData.value

  console.log('使用的数据源:', regionChartData.length > 0 ? 'regionChartData' : 'regionRankData')
  console.log('最终 chartData:', chartData)

  // 转换数据格式为地图所需格式，并聚合同一省份的数据
  console.log('原始图表数据:', chartData)
  console.log('图表数据类型:', typeof chartData, '是否为数组:', Array.isArray(chartData))

  if (chartData.length > 0) {
    console.log('第一条数据示例:', chartData[0])
    console.log('第一条数据的所有键:', Object.keys(chartData[0]))
  }

  const regionDataMap = {}
  chartData.forEach((item, index) => {
    const regionName = item.region
    const mappedName = cityToProvinceMap[regionName] || regionName
    const value = item.publishCount || item.count || 0

    if (index < 3) {
      console.log(`[${index}] 原始数据:`, item)
      console.log(`[${index}] 城市: ${regionName} -> 省份: ${mappedName}`)
      console.log(`[${index}] publishCount: ${item.publishCount}, count: ${item.count}, 最终值: ${value}`)
    }

    if (regionDataMap[mappedName]) {
      regionDataMap[mappedName] += value
    } else {
      regionDataMap[mappedName] = value
    }
  })

  const mapData = Object.entries(regionDataMap).map(([name, value]) => ({
    name,
    value: Number(value) || 0
  }))

  console.log('转换后的地图数据:', mapData)
  console.log('地图数据详情:', JSON.stringify(mapData, null, 2))

  // 检查数据有效性
  const validData = mapData.filter(item => !isNaN(item.value) && item.value > 0)
  console.log('有效数据:', validData)

  if (validData.length === 0) {
    console.warn('没有有效的地图数据')
    ElMessage.warning('暂无有效的地域数据')
    return
  }

  const maxValue = Math.max(...validData.map(item => item.value), 10)

  const option = {
    title: {
      text: '地域分布情况',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#303133'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>发文量: {c}'
    },
    visualMap: {
      min: 0,
      max: maxValue,
      text: ['高', '低'],
      realtime: false,
      calculable: true,
      inRange: {
        color: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f', '#c62828', '#b71c1c']
      },
      left: 'left',
      bottom: '10%'
    },
    series: [
      {
        name: '发文量',
        type: 'map',
        map: 'china',
        roam: true,
        itemStyle: {
          areaColor: '#f3f3f3',
          borderColor: '#999'
        },
        emphasis: {
          label: {
            show: true,
            color: '#000'
          },
          itemStyle: {
            areaColor: '#ffd700'
          }
        },
        data: mapData
      }
    ]
  }

  mapChart.setOption(option)
}

// 监听标签页切换
watch(activeTab, (newVal) => {
  console.log('标签页切换到:', newVal)
  if (newVal === 'statistics' && hasSearched.value) {
    console.log('切换到统计分析，准备初始化地图')
    console.log('regionChartData.value:', regionChartData.value)
    nextTick(() => {
      initMap(regionChartData.value)
    })
  }
})

const handleSizeChange = (val) => {
  pageSize.value = val
  if (hasSearched.value) {
    handleFilter()
  }
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  if (hasSearched.value) {
    handleFilter()
  }
}

const handleReset = () => {
  filterTopic.value = ''
  hasSearched.value = false
  currentPage.value = 1
  pageSize.value = 10
  recordsList.value = []
  total.value = 0

  // 重置统计数据
  statisticsData.value = {
    totalArticles: 0,
    sensitiveCount: 0,
    neutralCount: 0,
    normalCount: 0
  }
  regionRankData.value = []
  regionChartData.value = []
}

const handleProcess = () => {
  processForm.value = {
    result: '',
    remark: ''
  }
  showProcessDialog.value = true
}

const handleSubmitProcess = () => {
  if (!processForm.value.result) {
    ElMessage.warning('请选择处理结果')
    return
  }
  ElMessage.success('处理成功')
  showProcessDialog.value = false
}

const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${item.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await deleteAlertInfoAPI(item.newsId)
    if (res.code === 1) {
      ElMessage.success('删除成功')
      // 重新加载当前页数据
      handleFilter()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 辅助方法
const getSensitivityType = (level) => {
  switch (level) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'danger'
    case 3: return 'danger'
    default: return 'info'
  }
}

const getSentimentType = (type) => {
  switch (type) {
    case 1: return 'success' // 正面
    case 0: return 'info'    // 中性
    case -1: return 'danger' // 负面
    default: return 'info'
  }
}

const getSentimentLabel = (type) => {
  switch (type) {
    case 1: return '正面'
    case 0: return '中性'
    case -1: return '负面'
    default: return '未知'
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

const viewOriginal = (url) => {
  if (url) {
    window.open(url, '_blank')
  } else {
    ElMessage.warning('暂无原文链接')
  }
}

const copyLink = async (url) => {
  if (!url) {
    ElMessage.warning('暂无链接可复制')
    return
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      ElMessage.success('复制成功')
    } else {
      const input = document.createElement('input')
      input.setAttribute('value', url)
      document.body.appendChild(input)
      input.select()
      // eslint-disable-next-line
      document.execCommand('copy')
      document.body.removeChild(input)
      ElMessage.success('复制成功')
    }
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}

// 关键词高亮
const highlightKeyword = (text) => {
  if (!text) return ''
  // 这里可以根据实际需求添加关键词高亮逻辑
  // 暂时直接返回原文本
  return text
}

</script>

<style scoped>
.warning-records {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
}

.form-container {
  padding: 10px 0 0 0;
}

.result-card {
  min-height: 400px;
}

.result-header {
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
}

.empty-state {
  padding: 60px 0;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.record-item {
  display: flex;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  transition: box-shadow 0.3s;
}

.record-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.item-checkbox {
  margin-right: 15px;
  padding-top: 2px;
}

.item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.item-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.item-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  flex-wrap: wrap;
  gap: 10px;
}

.footer-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #909399;
  flex-wrap: wrap;
}

.footer-center {
  margin: 0 10px;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

/* 统计分析样式 */
.statistics-container {
  padding: 20px 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  position: relative;
  padding: 24px 20px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: left;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 顶部蓝色装饰条 */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #409eff;
}

/* 左上角弧形内凹裁切效果 */
.stat-card::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  width: 30px;
  height: 30px;
  background: #f0f2f5;
  border-radius: 50%;
}

.stat-card .stat-label {
  position: relative;
  z-index: 1;
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 400;
}

.stat-card .stat-value {
  position: relative;
  z-index: 1;
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
}

/* 不同卡片的数字颜色 */
.stat-card.card-blue .stat-value {
  color: #409eff;
}

.stat-card.card-purple .stat-value {
  color: #9c27b0;
}

.stat-card.card-orange .stat-value {
  color: #ff9800;
}

.stat-card.card-green {
  color: #4caf50;
}

.stat-card.card-green .stat-value {
  color: #4caf50;
}

.region-analysis {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

.region-map,
.region-table {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
}

.map-container {
  width: 100%;
  height: 500px;
}
</style>


