<template>
  <div class="report-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-item">
        <span class="label">报告名称:</span>
        <el-input v-model="searchForm.name" placeholder="请输入" clearable />
      </div>
      <div class="search-item">
        <span class="label">关键词:</span>
        <el-input v-model="searchForm.keyword" placeholder="请输入" clearable />
      </div>
      <div class="search-item">
        <span class="label">报告生成:</span>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </div>
      <div class="search-buttons">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button @click="handleBatchDownload">下载</el-button>
      <el-button @click="handleBatchDelete">删除</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="报告名称" min-width="200" />
      <el-table-column prop="keywords" label="监测关键词" min-width="200" />
      <el-table-column prop="createTime" label="生成时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button text type="primary" @click="handleView(row)">查看</el-button>
            <el-button text type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination  
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看报告对话框 -->
    <el-dialog
      v-model="showViewDialog"
      :title="currentReport.reportName || '报告详情'"
      width="90%"
      top="5vh"
      class="report-dialog"
    >
      <div class="report-content" v-loading="reportLoading">
        <div class="report-header">
          <div class="report-meta">
            <p><strong>监测关键词：</strong>{{ formatKeywords(currentReport.monitorKeywords) }}</p>
            <p><strong>报告类型：</strong>{{ currentReport.reportType === 1 ? '即时报告' : '定时报告' }}</p>
            <p><strong>生成时间：</strong>{{ currentReport.createTime }}</p>
          </div>
          <el-button type="primary" @click="handleDownloadReport">下载报告</el-button>
        </div>

        <div class="report-sections">
          <div class="section" v-if="currentReport.briefSummary">
            <h4>简报概述</h4>
            <div class="section-content">{{ currentReport.briefSummary }}</div>
          </div>

          <div class="section" v-if="currentReport.monitorSummary">
            <h4>舆情概述</h4>
            <div class="section-content">{{ currentReport.monitorSummary }}</div>
          </div>

          <div class="section" v-if="currentReport.opinionTrend">
            <h4>舆情发展趋势</h4>
            <div class="section-content">{{ currentReport.opinionTrend }}</div>
          </div>

          <div class="section" v-if="currentReport.sourceMediaAnalysis">
            <h4>来源媒体分析</h4>
            <div class="section-content">{{ currentReport.sourceMediaAnalysis }}</div>
          </div>

          <div class="section" v-if="currentReport.emotionAnalysis">
            <h4>倾向分析</h4>
            <div class="section-content">{{ currentReport.emotionAnalysis }}</div>
          </div>

          <div class="section" v-if="currentReport.regionDistributionList?.length">
            <h4>地域分布</h4>
            <div class="region-section">
              <div id="reportRegionMap" class="report-map-container"></div>
              <div class="region-rank-table">
                <el-table :data="currentReport.regionDistributionList" border size="small" max-height="360">
                  <el-table-column prop="rank" label="排名" width="55" align="center" />
                  <el-table-column prop="name" label="地域" min-width="120" />
                  <el-table-column prop="value" label="发文量" width="75" align="center" />
                  <el-table-column prop="percent" label="占比" width="85" align="center" />
                </el-table>
              </div>
            </div>
            <div v-if="currentReport.regionDistribution" class="region-description">
              {{ currentReport.regionDistribution }}
            </div>
          </div>

          <div class="section" v-if="currentReport.hotAnalysisWords || currentReport.hotAnalysisWordsList?.length">
            <h4>热词分析</h4>
            <div v-if="currentReport.hotAnalysisWordsList?.length" class="hotwords-section">
              <div ref="hotWordsCloudRef" class="hotwords-cloud"></div>
              <div class="hotwords-table">
                <el-table :data="currentReport.hotAnalysisWordsList.slice(0, 10)" border size="small" max-height="360">
                  <el-table-column prop="rank" label="排名" width="60" align="center">
                    <template #default="{ $index }">{{ $index + 1 }}</template>
                  </el-table-column>
                  <el-table-column prop="name" label="名称" min-width="120" />
                  <el-table-column prop="value" label="发文量" width="80" align="center" />
                  <el-table-column label="占比" width="90" align="center">
                    <template #default="{ row }">{{ calculatePercent(row.value) }}</template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div v-if="currentReport.hotAnalysisWordsList?.length" class="hotwords-summary">
              {{ generateHotWordsSummary(currentReport.hotAnalysisWordsList) }}
            </div>
          </div>

          <div class="section" v-if="currentReport.hotInformationList?.length">
            <div class="section-header">
              <h4>热门信息</h4>
            </div>
            <el-table :data="currentReport.hotInformationList" border size="small">
              <el-table-column prop="rank" label="排名" width="60" align="center" />
              <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
              <el-table-column prop="platform" label="发布平台" width="100" align="center" />
              <el-table-column prop="account" label="发文账号" width="120" align="center" />
              <el-table-column prop="type" label="信息类型" width="100" align="center" />
              <el-table-column prop="publishTime" label="发文时间" width="160" align="center" />
            </el-table>
          </div>

          <div class="section" v-if="currentReport.disposalOpinions !== undefined">
            <div class="section-header">
              <h4>处置意见</h4>
              <el-button
                v-if="!editingDisposal"
                type="primary"
                size="small"
                @click="handleEditDisposal"
              >
                编辑
              </el-button>
              <div v-else class="edit-actions">
                <el-button type="primary" size="small" @click="handleSaveDisposal" :loading="savingDisposal">保存</el-button>
                <el-button size="small" @click="handleCancelEditDisposal">取消</el-button>
              </div>
            </div>
            <div class="section-content" v-if="!editingDisposal">{{ currentReport.disposalOpinions || '暂无处置意见' }}</div>
            <el-input
              v-else
              v-model="disposalOpinionsEdit"
              type="textarea"
              :rows="6"
              placeholder="请输入处置意见"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReportResultListAPI, getReportDetailAPI, editReportResultAPI, deleteReportResultAPI } from '@/api/index'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import chinaJson from '@/assets/china.json'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

let reportMapChart = null
let hotWordsChart = null

// 与 WarningRecords 保持一致的地级市→省份映射表
const cityToProvinceMap = {
  '北京': '北京市', '北京市': '北京市',
  '上海': '上海市', '上海市': '上海市',
  '天津': '天津市', '天津市': '天津市',
  '重庆': '重庆市', '重庆市': '重庆市',
  '北碚': '重庆市', '北碚区': '重庆市', '重庆市北碚区': '重庆市',
  '石家庄': '河北省', '唐山': '河北省', '秦皇岛': '河北省', '邯郸': '河北省', '邢台': '河北省', '保定': '河北省', '张家口': '河北省', '承德': '河北省', '沧州': '河北省', '廊坊': '河北省', '衡水': '河北省',
  '太原': '山西省', '大同': '山西省', '阳泉': '山西省', '长治': '山西省', '晋城': '山西省', '朔州': '山西省', '晋中': '山西省', '运城': '山西省', '忻州': '山西省', '临汾': '山西省', '吕梁': '山西省',
  '呼和浩特': '内蒙古自治区', '包头': '内蒙古自治区', '乌海': '内蒙古自治区', '赤峰': '内蒙古自治区', '通辽': '内蒙古自治区', '鄂尔多斯': '内蒙古自治区', '呼伦贝尔': '内蒙古自治区', '巴彦淖尔': '内蒙古自治区', '乌兰察布': '内蒙古自治区',
  '沈阳': '辽宁省', '大连': '辽宁省', '鞍山': '辽宁省', '抚顺': '辽宁省', '本溪': '辽宁省', '丹东': '辽宁省', '锦州': '辽宁省', '营口': '辽宁省', '阜新': '辽宁省', '辽阳': '辽宁省', '盘锦': '辽宁省', '铁岭': '辽宁省', '朝阳': '辽宁省', '葫芦岛': '辽宁省',
  '长春': '吉林省', '吉林': '吉林省', '四平': '吉林省', '辽源': '吉林省', '通化': '吉林省', '白山': '吉林省', '松原': '吉林省', '白城': '吉林省',
  '哈尔滨': '黑龙江省', '齐齐哈尔': '黑龙江省', '鸡西': '黑龙江省', '鹤岗': '黑龙江省', '双鸭山': '黑龙江省', '大庆': '黑龙江省', '伊春': '黑龙江省', '佳木斯': '黑龙江省', '七台河': '黑龙江省', '牡丹江': '黑龙江省', '黑河': '黑龙江省', '绥化': '黑龙江省',
  '南京': '江苏省', '无锡': '江苏省', '徐州': '江苏省', '常州': '江苏省', '苏州': '江苏省', '南通': '江苏省', '连云港': '江苏省', '淮安': '江苏省', '盐城': '江苏省', '扬州': '江苏省', '镇江': '江苏省', '泰州': '江苏省', '宿迁': '江苏省',
  '杭州': '浙江省', '宁波': '浙江省', '温州': '浙江省', '嘉兴': '浙江省', '湖州': '浙江省', '绍兴': '浙江省', '金华': '浙江省', '衢州': '浙江省', '舟山': '浙江省', '台州': '浙江省', '丽水': '浙江省',
  '合肥': '安徽省', '芜湖': '安徽省', '蚌埠': '安徽省', '淮南': '安徽省', '马鞍山': '安徽省', '淮北': '安徽省', '铜陵': '安徽省', '安庆': '安徽省', '黄山': '安徽省', '滁州': '安徽省', '阜阳': '安徽省', '宿州': '安徽省', '六安': '安徽省', '亳州': '安徽省', '池州': '安徽省', '宣城': '安徽省',
  '福州': '福建省', '厦门': '福建省', '莆田': '福建省', '三明': '福建省', '泉州': '福建省', '漳州': '福建省', '南平': '福建省', '龙岩': '福建省', '宁德': '福建省',
  '南昌': '江西省', '景德镇': '江西省', '萍乡': '江西省', '九江': '江西省', '新余': '江西省', '鹰潭': '江西省', '赣州': '江西省', '吉安': '江西省', '宜春': '江西省', '抚州': '江西省', '上饶': '江西省',
  '济南': '山东省', '青岛': '山东省', '淄博': '山东省', '枣庄': '山东省', '东营': '山东省', '烟台': '山东省', '潍坊': '山东省', '济宁': '山东省', '泰安': '山东省', '威海': '山东省', '日照': '山东省', '临沂': '山东省', '德州': '山东省', '聊城': '山东省', '滨州': '山东省', '菏泽': '山东省',
  '郑州': '河南省', '开封': '河南省', '洛阳': '河南省', '平顶山': '河南省', '安阳': '河南省', '鹤壁': '河南省', '新乡': '河南省', '焦作': '河南省', '濮阳': '河南省', '许昌': '河南省', '漯河': '河南省', '三门峡': '河南省', '南阳': '河南省', '商丘': '河南省', '信阳': '河南省', '周口': '河南省', '驻马店': '河南省',
  '武汉': '湖北省', '黄石': '湖北省', '十堰': '湖北省', '宜昌': '湖北省', '襄阳': '湖北省', '鄂州': '湖北省', '荆门': '湖北省', '孝感': '湖北省', '荆州': '湖北省', '黄冈': '湖北省', '咸宁': '湖北省', '随州': '湖北省',
  '长沙': '湖南省', '株洲': '湖南省', '湘潭': '湖南省', '衡阳': '湖南省', '邵阳': '湖南省', '岳阳': '湖南省', '常德': '湖南省', '张家界': '湖南省', '益阳': '湖南省', '郴州': '湖南省', '永州': '湖南省', '怀化': '湖南省', '娄底': '湖南省',
  '广州': '广东省', '韶关': '广东省', '深圳': '广东省', '珠海': '广东省', '汕头': '广东省', '佛山': '广东省', '江门': '广东省', '湛江': '广东省', '茂名': '广东省', '肇庆': '广东省', '惠州': '广东省', '梅州': '广东省', '汕尾': '广东省', '河源': '广东省', '阳江': '广东省', '清远': '广东省', '东莞': '广东省', '中山': '广东省', '潮州': '广东省', '揭州': '广东省', '云浮': '广东省',
  '南宁': '广西壮族自治区', '柳州': '广西壮族自治区', '桂林': '广西壮族自治区', '梧州': '广西壮族自治区', '北海': '广西壮族自治区', '防城港': '广西壮族自治区', '钦州': '广西壮族自治区', '贵港': '广西壮族自治区', '玉林': '广西壮族自治区', '百色': '广西壮族自治区', '贺州': '广西壮族自治区', '河池': '广西壮族自治区', '来宾': '广西壮族自治区', '崇左': '广西壮族自治区',
  '海口': '海南省', '三亚': '海南省',
  '成都': '四川省', '自贡': '四川省', '攀枝花': '四川省', '泸州': '四川省', '德阳': '四川省', '绵阳': '四川省', '广元': '四川省', '遂宁': '四川省', '内江': '四川省', '乐山': '四川省', '南充': '四川省', '眉山': '四川省', '宜宾': '四川省', '广安': '四川省', '达州': '四川省', '雅安': '四川省', '巴中': '四川省', '资阳': '四川省',
  '贵阳': '贵州省', '六盘水': '贵州省', '遵义': '贵州省', '安顺': '贵州省', '毕节': '贵州省', '铜仁': '贵州省',
  '昆明': '云南省', '曲靖': '云南省', '玉溪': '云南省', '保山': '云南省', '昭通': '云南省', '丽江': '云南省', '普洱': '云南省', '临沧': '云南省',
  '拉萨': '西藏自治区',
  '西安': '陕西省', '铜川': '陕西省', '宝鸡': '陕西省', '咸阳': '陕西省', '渭南': '陕西省', '延安': '陕西省', '汉中': '陕西省', '榆林': '陕西省', '安康': '陕西省', '商洛': '陕西省',
  '兰州': '甘肃省', '嘉峪关': '甘肃省', '金昌': '甘肃省', '白银': '甘肃省', '天水': '甘肃省', '武威': '甘肃省', '张掖': '甘肃省', '平凉': '甘肃省', '酒泉': '甘肃省', '庆阳': '甘肃省', '定西': '甘肃省', '陇南': '甘肃省',
  '西宁': '青海省',
  '银川': '宁夏回族自治区', '石嘴山': '宁夏回族自治区', '吴忠': '宁夏回族自治区', '固原': '宁夏回族自治区', '中卫': '宁夏回族自治区',
  '乌鲁木齐': '新疆维吾尔自治区', '克拉玛依': '新疆维吾尔自治区', '吐鲁番': '新疆维吾尔自治区', '哈密': '新疆维吾尔自治区',
  '香港': '香港特别行政区', '澳门': '澳门特别行政区', '台北': '台湾省', '台湾': '台湾省'
}

const searchForm = ref({
  name: '',
  keyword: '',
  dateRange: []
})

const tableData = ref([])
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showViewDialog = ref(false)
const currentReport = ref({})
const reportLoading = ref(false)
const editingDisposal = ref(false)
const disposalOpinionsEdit = ref('')
const savingDisposal = ref(false)
const hotWordsCloudRef = ref(null)

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'

  try {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (e) {
    console.error('格式化时间失败:', e)
    return time
  }
}

// 格式化关键词显示
const formatKeywords = (monitorKeywords) => {
  try {
    if (!monitorKeywords) return '-'

    let keywords = monitorKeywords
    if (typeof keywords === 'string') {
      keywords = JSON.parse(keywords)
    }

    // 如果是数组格式
    if (Array.isArray(keywords)) {
      return keywords.join('、')
    }

    // 如果是对象格式 {keywordGroups: [["关键词1"], ["关键词2"]]}
    if (keywords.keywordGroups && Array.isArray(keywords.keywordGroups)) {
      const allKeywords = keywords.keywordGroups.flat()
      return allKeywords.join('、')
    }

    return '-'
  } catch (e) {
    console.error('格式化关键词失败:', e)
    return '-'
  }
}

// 获取报告列表
const fetchReportList = async () => {
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    // 添加搜索条件
    if (searchForm.value.name) {
      params.reportName = searchForm.value.name
    }

    if (searchForm.value.keyword) {
      params.monitor_keywords = {
        keywordGroups: [[searchForm.value.keyword]]
      }
    }

    if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
      params.startDate = searchForm.value.dateRange[0]
      params.endDate = searchForm.value.dateRange[1]
    }

    const res = await getReportResultListAPI(params)

    if (res.code === 1 && res.data) {
      tableData.value = (res.data.resultList || []).map(item => ({
        id: item.reportId,
        name: item.reportName,
        keywords: formatKeywords(item.monitorKeywords),
        createTime: formatTime(item.createTime),
        content: item.content || '暂无内容',
        rawData: item
      }))
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (error) {
    console.error('查询报告列表失败:', error)
    ElMessage.error('查询失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchReportList()
}

const handleReset = () => {
  searchForm.value = {
    name: '',
    keyword: '',
    dateRange: []
  }
  currentPage.value = 1
  fetchReportList()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleBatchDownload = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要下载的报告')
    return
  }
  ElMessage.success(`已下载${selectedRows.value.length}个报告`)
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的报告')
    return
  }
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个报告吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleView = async (row) => {
  try {
    reportLoading.value = true
    showViewDialog.value = true
    editingDisposal.value = false

    const res = await getReportDetailAPI(row.id)

    if (res.code === 1 && res.data && res.data.reportResult) {
      const report = res.data.reportResult
      currentReport.value = {
        reportId: report.reportId,
        reportName: report.reportName,
        monitorKeywords: report.monitorKeywords,
        reportType: report.reportType,
        createTime: formatTime(report.createTime),
        briefSummary: report.briefSummary || '',
        monitorSummary: report.monitorSummary || '',
        opinionTrend: report.opinionTrend || '',
        sourceMediaAnalysis: report.sourceMediaAnalysis || '',
        emotionAnalysis: report.emotionAnalysis || '',
        regionDistribution: report.regionDistribution || '',
        regionDistributionList: parseRegionList(report.regionDistributionList),
        hotAnalysisWords: report.hotAnalysisWords || '',
        hotAnalysisWordsList: parseHotWordsList(report.hotAnalysisWordsList),
        hotInformation: report.hotInformation || '',
        hotInformationList: parseHotInformationList(report.hotInformationList) || parseHotInformationText(report.hotInformation),
        disposalOpinions: report.disposalOpinions || ''
      }
      // 有地域数据时初始化热力图
      if (currentReport.value.regionDistributionList.length) {
        nextTick(() => initReportMap(currentReport.value.regionDistributionList))
      }
      // 有热词数据时初始化词云图
      if (currentReport.value.hotAnalysisWordsList.length) {
        nextTick(() => initHotWordsCloud(currentReport.value.hotAnalysisWordsList))
      }
    } else {
      ElMessage.error(res.msg || '获取报告详情失败')
      showViewDialog.value = false
    }
  } catch (error) {
    console.error('获取报告详情失败:', error)
    ElMessage.error('获取报告详情失败')
    showViewDialog.value = false
  } finally {
    reportLoading.value = false
  }
}

const handleDownloadReport = async () => {
  try {
    ElMessage.info('正在生成 PDF，请稍候...')

    // 获取报告内容区域
    const reportContent = document.querySelector('.report-content')
    if (!reportContent) {
      ElMessage.error('未找到报告内容')
      return
    }

    // 临时隐藏所有按钮和编辑操作
    const downloadBtn = reportContent.querySelector('.report-header .el-button')
    const editBtns = reportContent.querySelectorAll('.section-header .el-button, .edit-actions')

    if (downloadBtn) downloadBtn.style.display = 'none'
    editBtns.forEach(btn => { btn.style.display = 'none' })

    // 使用 html2canvas 将内容转换为图片
    const canvas = await html2canvas(reportContent, {
      scale: 2, // 提高清晰度
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // 恢复按钮显示
    if (downloadBtn) downloadBtn.style.display = ''
    editBtns.forEach(btn => { btn.style.display = '' })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 190 // A4 宽度（mm）- 左右边距
    const pageHeight = 277 // A4 高度（mm）- 上下边距
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 10 // 顶部边距

    // 添加第一页
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 如果内容超过一页，添加更多页
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // 下载 PDF
    const fileName = `${currentReport.value.reportName || '报告'}_${new Date().getTime()}.pdf`
    pdf.save(fileName)

    ElMessage.success('PDF 下载成功')
  } catch (error) {
    console.error('生成 PDF 失败:', error)
    ElMessage.error('生成 PDF 失败，请重试')
  }
}

// 解析 regionDistributionList（兼容双重转义字符串、普通字符串、数组）
const parseRegionList = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    // 双重转义：第一次解析结果仍是字符串时再解析一次
    if (typeof parsed === 'string') parsed = JSON.parse(parsed)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('regionDistributionList 解析失败:', e)
    return []
  }
}

// 解析 hotAnalysisWordsList（兼容双重转义字符串、普通字符串、数组）
const parseHotWordsList = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    // 双重转义：第一次解析结果仍是字符串时再解析一次
    if (typeof parsed === 'string') parsed = JSON.parse(parsed)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('hotAnalysisWordsList 解析失败:', e)
    return []
  }
}

// 解析 hotInformationList（兼容双重转义字符串、普通字符串、数组）
const parseHotInformationList = (raw) => {
  console.log('hotInformationList 原始数据:', raw)
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    // 双重转义：第一次解析结果仍是字符串时再解析一次
    if (typeof parsed === 'string') parsed = JSON.parse(parsed)
    console.log('hotInformationList 解析结果:', parsed)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('hotInformationList 解析失败:', e)
    return []
  }
}

// 从 hotInformation 文本中解析出结构化数据
const parseHotInformationText = (text) => {
  if (!text) return []

  const lines = text.split('\n').filter(line => line.trim())
  const result = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    // 匹配序号开头的行，如 "1. 标题"
    const match = line.match(/^(\d+)\.\s+(.+)/)
    if (match) {
      const rank = match[1]
      const title = match[2]

      // 读取下一行的详细信息
      if (i + 1 < lines.length) {
        const detailLine = lines[i + 1].trim()
        const platformMatch = detailLine.match(/平台：([^|]+)/)
        const accountMatch = detailLine.match(/发布者：([^|]+)/)
        const emotionMatch = detailLine.match(/情绪：([^|]+)/)

        // 读取第三行的时间和评论数
        let publishTime = ''
        let comments = ''
        if (i + 2 < lines.length) {
          const timeLine = lines[i + 2].trim()
          const timeMatch = timeLine.match(/时间：([^|]+)/)
          const commentsMatch = timeLine.match(/评论数：(\d+)/)
          if (timeMatch) publishTime = timeMatch[1].trim()
          if (commentsMatch) comments = commentsMatch[1]
        }

        result.push({
          rank: parseInt(rank),
          title: title,
          platform: platformMatch ? platformMatch[1].trim() : '',
          account: accountMatch ? accountMatch[1].trim() : '',
          type: emotionMatch ? emotionMatch[1].trim() : '',
          publishTime: publishTime,
          comments: comments
        })
      }
    }
  }

  return result
}

// 初始化报告地域热力图（仿照 WarningRecords.initMap）
const initReportMap = (list) => {
  const mapDom = document.getElementById('reportRegionMap')
  if (!mapDom) return

  if (reportMapChart) reportMapChart.dispose()
  reportMapChart = echarts.init(mapDom)
  echarts.registerMap('china', chinaJson)

  // 聚合：将地级市/区名映射到省级，相同省份累加
  const regionDataMap = {}
  list.forEach(item => {
    const mappedName = cityToProvinceMap[item.name] || item.name
    regionDataMap[mappedName] = (regionDataMap[mappedName] || 0) + (item.value || 0)
  })

  const mapData = Object.entries(regionDataMap).map(([name, value]) => ({ name, value }))
  const validData = mapData.filter(d => d.value > 0)
  if (!validData.length) {
    ElMessage.warning('暂无有效的地域数据')
    return
  }

  const maxValue = Math.max(...validData.map(d => d.value), 1)

  reportMapChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: ({ name, value }) => `${name}<br/>发文量：${value ?? 0}`
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
    series: [{
      name: '发文量',
      type: 'map',
      map: 'china',
      roam: true,
      itemStyle: { areaColor: '#f3f3f3', borderColor: '#999' },
      emphasis: {
        label: { show: true, color: '#000' },
        itemStyle: { areaColor: '#ffd700' }
      },
      data: mapData
    }]
  })
}

// 初始化热词词云图
const initHotWordsCloud = (list) => {
  if (!hotWordsCloudRef.value || !list.length) return

  if (hotWordsChart) hotWordsChart.dispose()
  hotWordsChart = echarts.init(hotWordsCloudRef.value)

  const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4']

  hotWordsChart.setOption({
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      sizeRange: [14, 50],
      rotationRange: [-30, 30],
      rotationStep: 15,
      gridSize: 8,
      left: 'center',
      top: 'center',
      right: null,
      bottom: null,
      width: '90%',
      height: '90%',
      drawOutOfBound: false,
      shrinkToFit: true,
      textStyle: {
        color: () => colors[Math.floor(Math.random() * colors.length)]
      },
      data: list.map(item => ({
        name: item.name,
        value: item.value,
        textStyle: {
          color: colors[Math.floor(Math.random() * colors.length)]
        }
      }))
    }]
  })
}

// 计算热词占比
const calculatePercent = (value) => {
  if (!currentReport.value.hotAnalysisWordsList?.length) return '0%'
  const total = currentReport.value.hotAnalysisWordsList.reduce((sum, item) => sum + (item.value || 0), 0)
  if (total === 0) return '0%'
  return ((value / total) * 100).toFixed(2) + '%'
}

// 生成热词统计摘要
const generateHotWordsSummary = (list) => {
  if (!list || !list.length) return ''

  const total = list.reduce((sum, item) => sum + (item.value || 0), 0)
  const top3 = list.slice(0, 3)
  const top3Names = top3.map(item => `"${item.name}"`).join('、')
  const top3Total = top3.reduce((sum, item) => sum + (item.value || 0), 0)
  const top3Percent = total > 0 ? ((top3Total / total) * 100).toFixed(1) : 0

  return `共检测到 ${list.length} 个热词，总发文量 ${total} 篇。其中热度最高的前三个热词为：${top3Names}，合计占比 ${top3Percent}%。`
}

// 编辑处置意见
const handleEditDisposal = () => {
  disposalOpinionsEdit.value = currentReport.value.disposalOpinions
  editingDisposal.value = true
}

// 取消编辑处置意见
const handleCancelEditDisposal = () => {
  editingDisposal.value = false
  disposalOpinionsEdit.value = ''
}

// 保存处置意见
const handleSaveDisposal = async () => {
  try {
    savingDisposal.value = true

    const params = {
      reportId: currentReport.value.reportId,
      reportName: currentReport.value.reportName,
      briefSummary: currentReport.value.briefSummary,
      monitorSummary: currentReport.value.monitorSummary,
      opinionTrend: currentReport.value.opinionTrend,
      sourceMediaAnalysis: currentReport.value.sourceMediaAnalysis,
      emotionAnalysis: currentReport.value.emotionAnalysis,
      regionDistribution: currentReport.value.regionDistribution,
      hotAnalysisWords: currentReport.value.hotAnalysisWords,
      hotInformation: currentReport.value.hotInformation,
      disposalOpinions: disposalOpinionsEdit.value
    }

    const res = await editReportResultAPI(params)

    if (res.code === 1) {
      ElMessage.success('保存成功')
      currentReport.value.disposalOpinions = disposalOpinionsEdit.value
      editingDisposal.value = false
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    savingDisposal.value = false
  }
}

const handleDownload = async (row) => {
  try {
    // 先打开对话框加载报告内容
    await handleView(row)

    // 等待对话框和内容完全加载
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))

    // 调用下载 PDF 功能
    await handleDownloadReport()

    // 下载完成后关闭对话框
    showViewDialog.value = false
  } catch (error) {
    console.error('下载报告失败:', error)
    ElMessage.error('下载报告失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该报告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteReportResultAPI(row.id)

    if (res.code === 1) {
      ElMessage.success('删除成功')
      fetchReportList()
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

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchReportList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchReportList()
}

// 页面加载时获取数据
onMounted(() => {
  fetchReportList()
})
</script>

<style scoped>
.report-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item .label {
  white-space: nowrap;
  color: #666;
  font-size: 14px;
}

.search-item .el-input {
  width: 200px;
}

.search-item .el-date-picker {
  width: 280px;
}

.search-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.report-content {
  padding: 20px;
  min-height: 400px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.report-meta {
  flex: 1;
}

.report-meta p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.report-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.section h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.section-content {
  color: #666;
  line-height: 1.8;
  font-size: 14px;
  white-space: pre-wrap;
}

.region-section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.report-map-container {
  flex: 1;
  height: 360px;
  min-width: 0;
}

.region-rank-table {
  width: 360px;
  flex-shrink: 0;
}

.region-description {
  margin-top: 15px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
}

.hotwords-section {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 15px;
}

.hotwords-cloud {
  flex: 1;
  height: 360px;
  min-width: 0;
  border-radius: 4px;
}

.hotwords-table {
  width: 360px;
  flex-shrink: 0;
}

.hotwords-summary {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
}

.report-content h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.report-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

.report-info p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.report-detail h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.report-detail p {
  color: #666;
  line-height: 1.8;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: flex-start;
}

.action-buttons .el-button {
  padding: 0 8px;
  font-size: 13px;
}
</style>
