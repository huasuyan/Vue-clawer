<template>
  <div class="monitor-page">
    <!-- ========== 筛选条件面板 ========== -->
    <div class="filter-panel">
      <div class="filter-row">
        <span class="filter-label">时间范围：</span>
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button value="today">今日</el-radio-button>
          <el-radio-button value="week">近七天</el-radio-button>
          <el-radio-button value="month">近三十天</el-radio-button>
          <el-radio-button value="custom">自选日期</el-radio-button>
        </el-radio-group>
        <template v-if="timeRange === 'custom'">
          <el-date-picker
            v-model="customStartDate"
            type="date"
            placeholder="开始日期"
            value-format="YYYY-MM-DD"
            style="margin-left: 12px; width: 150px"
          />
          <span style="margin: 0 8px; color: #999">至</span>
          <el-date-picker
            v-model="customEndDate"
            type="date"
            placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </template>
      </div>

      <div class="filter-row">
        <span class="filter-label">信息属性：</span>
        <el-checkbox-group v-model="sensitivityLevel">
          <el-checkbox value="0">普通</el-checkbox>
          <el-checkbox value="1">低敏感</el-checkbox>
          <el-checkbox value="2">中敏感</el-checkbox>
          <el-checkbox value="3">高敏感</el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="filter-row">
        <span class="filter-label">文章来源：</span>
        <el-select v-model="source" placeholder="请选择来源" style="width: 200px" clearable>
          <el-option label="所有" value="" />
          <el-option v-for="item in sourceList" :key="item" :label="item" :value="item" />
        </el-select>
        <span class="filter-label" style="margin-left: 20px">地域：</span>
        <el-input v-model="region" placeholder="请输入地域" style="width: 200px" clearable />
      </div>

      <div class="filter-row">
        <span class="filter-label">关键词搜索：</span>
        <el-input
          v-model="keyword"
          placeholder="输入关键词，将匹配预警/报告专题中的词组"
          style="width: 400px"
          clearable
        />
      </div>

      <div class="filter-actions">
        <el-button type="primary" @click="handleSearch" :loading="loading">
          查询
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- ========== 选项卡区域 ========== -->
    <div class="tab-panel">
      <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">
        <!-- -------- Tab 1: 文章监测 -------- -->
        <el-tab-pane label="文章监测" name="article">
          <div class="toolbar">
            <span class="result-count">共 {{ articleTotal }} 条结果</span>
            <el-button type="success" @click="switchToStatistics" :disabled="articleList.length === 0">
              统计图表
            </el-button>
          </div>

          <div v-if="!loading && articleList.length === 0" class="empty-state">
            <el-empty description="暂无数据，请设置筛选条件后点击查询" />
          </div>

          <div v-else class="records-list">
            <div class="record-item" v-for="(item, index) in articleList" :key="item.newsId || index">
              <div class="item-main">
                <div class="item-title-row">
                  <span class="item-title">{{ item.title }}</span>
                  <div class="item-tags">
                    <el-tag size="small" v-if="item.source" type="primary" effect="plain">{{ item.source }}</el-tag>
                    <el-tag size="small" v-if="item.sensitivityLevel !== undefined" :type="sensitivityTagType(item.sensitivityLevel)" effect="plain">
                      {{ sensitivityLabel(item.sensitivityLevel) }}
                    </el-tag>
                    <el-tag size="small" v-if="item.sentimentType !== undefined" :type="sentimentTagType(item.sentimentType)" effect="plain">
                      {{ sentimentLabel(item.sentimentType) }}
                    </el-tag>
                    <el-tag size="small" v-if="item.region" type="primary" effect="plain">{{ item.region }}</el-tag>
                  </div>
                </div>

                <div class="item-content">
                  {{ item.content || '暂无内容摘要' }}
                </div>

                <div class="item-footer">
                  <div class="footer-meta">
                    <span v-if="item.source">来源：{{ item.source }}</span>
                    <span v-if="item.publishTime">发文时间：{{ item.publishTime }}</span>
                    <span v-if="item.region">地域：{{ item.region }}</span>
                  </div>
                  <div class="footer-actions">
                    <el-button v-if="item.url" link type="primary" @click="openUrl(item.url)">查看原文</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination" v-if="articleTotal > 0">
            <el-pagination
              v-model:current-page="articlePageNum"
              v-model:page-size="articlePageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="articleTotal"
              @size-change="handleSearch"
              @current-change="handleSearch"
            />
          </div>
        </el-tab-pane>

        <!-- -------- Tab 2: 统计图表 -------- -->
        <el-tab-pane label="统计图表" name="statistics">
          <div v-if="hasStats" class="statistics-container">
            <!-- 统计卡片 -->
            <div class="stats-cards">
              <div class="stat-card card-blue">
                <div class="stat-label">文章总数</div>
                <div class="stat-value">{{ statsData.totalArticles }}</div>
              </div>
              <div class="stat-card card-purple">
                <div class="stat-label">敏感总数</div>
                <div class="stat-value">{{ statsData.sensitiveCount }}</div>
              </div>
              <div class="stat-card card-orange">
                <div class="stat-label">中性总数</div>
                <div class="stat-value">{{ statsData.neutralCount }}</div>
              </div>
              <div class="stat-card card-green">
                <div class="stat-label">非敏感总数</div>
                <div class="stat-value">{{ statsData.normalCount }}</div>
              </div>
            </div>

            <!-- 地域分布 -->
            <div class="region-analysis">
              <div class="region-map">
                <div class="section-title">地域分布热图</div>
                <div ref="chinaMapRef" class="map-container"></div>
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

            <!-- 四张图表 -->
            <div class="chart-row">
              <div class="chart-card">
                <h3 class="chart-title">文章来源分布</h3>
                <div ref="sourceChartRef" class="chart-box"></div>
              </div>
              <div class="chart-card">
                <h3 class="chart-title">发布时间趋势</h3>
                <div ref="trendChartRef" class="chart-box"></div>
              </div>
            </div>
            <div class="chart-row">
              <div class="chart-card">
                <h3 class="chart-title">敏感等级分布</h3>
                <div ref="sensitivityChartRef" class="chart-box"></div>
              </div>
              <div class="chart-card">
                <h3 class="chart-title">情感极性分布</h3>
                <div ref="sentimentChartRef" class="chart-box"></div>
              </div>
            </div>
          </div>
          <el-empty v-else description="请先在「文章监测」中查询数据" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ========== 文章详情对话框 ========== -->
    <el-dialog v-model="detailVisible" title="文章详情" width="700px">
      <div v-if="detailData" class="detail-content">
        <h2 class="detail-title">{{ detailData.title }}</h2>
        <div class="detail-meta">
          <span>来源：{{ detailData.source || '未知' }}</span>
          <span>发布时间：{{ detailData.publishTime || '未知' }}</span>
        </div>
        <div class="detail-body">{{ detailData.content || '暂无内容' }}</div>
        <div v-if="detailData.url" class="detail-link">
          <a :href="detailData.url" target="_blank">查看原文链接</a>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import chinaJson from '@/assets/china.json'
import {
  getMonitorArticleAPI,
  searchAllSourceAPI
} from '@/api'

// ==================== 筛选条件 ====================
const timeRange = ref('today')
const customStartDate = ref('')
const customEndDate = ref('')
const sensitivityLevel = ref(['0', '1', '2', '3'])
const source = ref('')
const sourceList = ref([])
const region = ref('')
const keyword = ref('')
const loading = ref(false)
const activeTab = ref('article')
const articleList = ref([])
const articleTotal = ref(0)
const articlePageNum = ref(1)
const articlePageSize = ref(20)
const hasStats = ref(false)
const statsData = ref({ totalArticles: 0, sensitiveCount: 0, neutralCount: 0, normalCount: 0 })
const regionRankData = ref([])
const detailVisible = ref(false)
const detailData = ref(null)
const chinaMapRef = ref(null)
const sourceChartRef = ref(null)
const trendChartRef = ref(null)
const sensitivityChartRef = ref(null)
const sentimentChartRef = ref(null)
let sourceChartInstance = null
let trendChartInstance = null
let sensitivityChartInstance = null
let sentimentChartInstance = null
let mapChart = null

const cityToProvinceMap = {
  '北京': '北京市', '北京市': '北京市',
  '上海': '上海市', '上海市': '上海市',
  '天津': '天津市', '天津市': '天津市',
  '重庆': '重庆市', '重庆市': '重庆市',
  '石家庄': '河北省', '石家庄市': '河北省', '唐山': '河北省', '唐山市': '河北省',
  '秦皇岛': '河北省', '秦皇岛市': '河北省', '邯郸': '河北省', '邯郸市': '河北省',
  '邢台': '河北省', '邢台市': '河北省', '保定': '河北省', '保定市': '河北省',
  '张家口': '河北省', '张家口市': '河北省', '承德': '河北省', '承德市': '河北省',
  '沧州': '河北省', '沧州市': '河北省', '廊坊': '河北省', '廊坊市': '河北省',
  '衡水': '河北省', '衡水市': '河北省',
  '太原': '山西省', '太原市': '山西省', '大同': '山西省', '大同市': '山西省',
  '阳泉': '山西省', '阳泉市': '山西省', '长治': '山西省', '长治市': '山西省',
  '晋城': '山西省', '晋城市': '山西省', '朔州': '山西省', '朔州市': '山西省',
  '晋中': '山西省', '晋中市': '山西省', '运城': '山西省', '运城市': '山西省',
  '忻州': '山西省', '忻州市': '山西省', '临汾': '山西省', '临汾市': '山西省',
  '吕梁': '山西省', '吕梁市': '山西省',
  '呼和浩特': '内蒙古自治区', '呼和浩特市': '内蒙古自治区', '包头': '内蒙古自治区', '包头市': '内蒙古自治区',
  '乌海': '内蒙古自治区', '乌海市': '内蒙古自治区', '赤峰': '内蒙古自治区', '赤峰市': '内蒙古自治区',
  '通辽': '内蒙古自治区', '通辽市': '内蒙古自治区', '鄂尔多斯': '内蒙古自治区', '鄂尔多斯市': '内蒙古自治区',
  '呼伦贝尔': '内蒙古自治区', '呼伦贝尔市': '内蒙古自治区', '巴彦淖尔': '内蒙古自治区', '巴彦淖尔市': '内蒙古自治区',
  '乌兰察布': '内蒙古自治区', '乌兰察布市': '内蒙古自治区',
  '沈阳': '辽宁省', '沈阳市': '辽宁省', '大连': '辽宁省', '大连市': '辽宁省',
  '鞍山': '辽宁省', '鞍山市': '辽宁省', '抚顺': '辽宁省', '抚顺市': '辽宁省',
  '本溪': '辽宁省', '本溪市': '辽宁省', '丹东': '辽宁省', '丹东市': '辽宁省',
  '锦州': '辽宁省', '锦州市': '辽宁省', '营口': '辽宁省', '营口市': '辽宁省',
  '阜新': '辽宁省', '阜新市': '辽宁省', '辽阳': '辽宁省', '辽阳市': '辽宁省',
  '盘锦': '辽宁省', '盘锦市': '辽宁省', '铁岭': '辽宁省', '铁岭市': '辽宁省',
  '朝阳': '辽宁省', '朝阳市': '辽宁省', '葫芦岛': '辽宁省', '葫芦岛市': '辽宁省',
  '长春': '吉林省', '长春市': '吉林省', '吉林': '吉林省', '吉林市': '吉林省',
  '四平': '吉林省', '四平市': '吉林省', '辽源': '吉林省', '辽源市': '吉林省',
  '通化': '吉林省', '通化市': '吉林省', '白山': '吉林省', '白山市': '吉林省',
  '松原': '吉林省', '松原市': '吉林省', '白城': '吉林省', '白城市': '吉林省',
  '哈尔滨': '黑龙江省', '哈尔滨市': '黑龙江省', '齐齐哈尔': '黑龙江省', '齐齐哈尔市': '黑龙江省',
  '鸡西': '黑龙江省', '鸡西市': '黑龙江省', '鹤岗': '黑龙江省', '鹤岗市': '黑龙江省',
  '双鸭山': '黑龙江省', '双鸭山市': '黑龙江省', '大庆': '黑龙江省', '大庆市': '黑龙江省',
  '伊春': '黑龙江省', '伊春市': '黑龙江省', '佳木斯': '黑龙江省', '佳木斯市': '黑龙江省',
  '七台河': '黑龙江省', '七台河市': '黑龙江省', '牡丹江': '黑龙江省', '牡丹江市': '黑龙江省',
  '黑河': '黑龙江省', '黑河市': '黑龙江省', '绥化': '黑龙江省', '绥化市': '黑龙江省',
  '南京': '江苏省', '南京市': '江苏省', '无锡': '江苏省', '无锡市': '江苏省',
  '徐州': '江苏省', '徐州市': '江苏省', '常州': '江苏省', '常州市': '江苏省',
  '苏州': '江苏省', '苏州市': '江苏省', '南通': '江苏省', '南通市': '江苏省',
  '连云港': '江苏省', '连云港市': '江苏省', '淮安': '江苏省', '淮安市': '江苏省',
  '盐城': '江苏省', '盐城市': '江苏省', '扬州': '江苏省', '扬州市': '江苏省',
  '镇江': '江苏省', '镇江市': '江苏省', '泰州': '江苏省', '泰州市': '江苏省',
  '宿迁': '江苏省', '宿迁市': '江苏省',
  '杭州': '浙江省', '杭州市': '浙江省', '宁波': '浙江省', '宁波市': '浙江省',
  '温州': '浙江省', '温州市': '浙江省', '嘉兴': '浙江省', '嘉兴市': '浙江省',
  '湖州': '浙江省', '湖州市': '浙江省', '绍兴': '浙江省', '绍兴市': '浙江省',
  '金华': '浙江省', '金华市': '浙江省', '衢州': '浙江省', '衢州市': '浙江省',
  '舟山': '浙江省', '舟山市': '浙江省', '台州': '浙江省', '台州市': '浙江省',
  '丽水': '浙江省', '丽水市': '浙江省',
  '合肥': '安徽省', '合肥市': '安徽省', '芜湖': '安徽省', '芜湖市': '安徽省',
  '蚌埠': '安徽省', '蚌埠市': '安徽省', '淮南': '安徽省', '淮南市': '安徽省',
  '马鞍山': '安徽省', '马鞍山市': '安徽省', '淮北': '安徽省', '淮北市': '安徽省',
  '铜陵': '安徽省', '铜陵市': '安徽省', '安庆': '安徽省', '安庆市': '安徽省',
  '黄山': '安徽省', '黄山市': '安徽省', '滁州': '安徽省', '滁州市': '安徽省',
  '阜阳': '安徽省', '阜阳市': '安徽省', '宿州': '安徽省', '宿州市': '安徽省',
  '六安': '安徽省', '六安市': '安徽省', '亳州': '安徽省', '亳州市': '安徽省',
  '池州': '安徽省', '池州市': '安徽省', '宣城': '安徽省', '宣城市': '安徽省',
  '福州': '福建省', '福州市': '福建省', '厦门': '福建省', '厦门市': '福建省',
  '莆田': '福建省', '莆田市': '福建省', '三明': '福建省', '三明市': '福建省',
  '泉州': '福建省', '泉州市': '福建省', '漳州': '福建省', '漳州市': '福建省',
  '南平': '福建省', '南平市': '福建省', '龙岩': '福建省', '龙岩市': '福建省',
  '宁德': '福建省', '宁德市': '福建省',
  '南昌': '江西省', '南昌市': '江西省', '景德镇': '江西省', '景德镇市': '江西省',
  '萍乡': '江西省', '萍乡市': '江西省', '九江': '江西省', '九江市': '江西省',
  '新余': '江西省', '新余市': '江西省', '鹰潭': '江西省', '鹰潭市': '江西省',
  '赣州': '江西省', '赣州市': '江西省', '吉安': '江西省', '吉安市': '江西省',
  '宜春': '江西省', '宜春市': '江西省', '抚州': '江西省', '抚州市': '江西省',
  '上饶': '江西省', '上饶市': '江西省',
  '济南': '山东省', '济南市': '山东省', '青岛': '山东省', '青岛市': '山东省',
  '淄博': '山东省', '淄博市': '山东省', '枣庄': '山东省', '枣庄市': '山东省',
  '东营': '山东省', '东营市': '山东省', '烟台': '山东省', '烟台市': '山东省',
  '潍坊': '山东省', '潍坊市': '山东省', '济宁': '山东省', '济宁市': '山东省',
  '泰安': '山东省', '泰安市': '山东省', '威海': '山东省', '威海市': '山东省',
  '日照': '山东省', '日照市': '山东省', '临沂': '山东省', '临沂市': '山东省',
  '德州': '山东省', '德州市': '山东省', '聊城': '山东省', '聊城市': '山东省',
  '滨州': '山东省', '滨州市': '山东省', '菏泽': '山东省', '菏泽市': '山东省',
  '郑州': '河南省', '郑州市': '河南省', '开封': '河南省', '开封市': '河南省',
  '洛阳': '河南省', '洛阳市': '河南省', '平顶山': '河南省', '平顶山市': '河南省',
  '安阳': '河南省', '安阳市': '河南省', '鹤壁': '河南省', '鹤壁市': '河南省',
  '新乡': '河南省', '新乡市': '河南省', '焦作': '河南省', '焦作市': '河南省',
  '濮阳': '河南省', '濮阳市': '河南省', '许昌': '河南省', '许昌市': '河南省',
  '漯河': '河南省', '漯河市': '河南省', '三门峡': '河南省', '三门峡市': '河南省',
  '南阳': '河南省', '南阳市': '河南省', '商丘': '河南省', '商丘市': '河南省',
  '信阳': '河南省', '信阳市': '河南省', '周口': '河南省', '周口市': '河南省',
  '驻马店': '河南省', '驻马店市': '河南省', '济源': '河南省', '济源市': '河南省',
  '武汉': '湖北省', '武汉市': '湖北省', '黄石': '湖北省', '黄石市': '湖北省',
  '十堰': '湖北省', '十堰市': '湖北省', '宜昌': '湖北省', '宜昌市': '湖北省',
  '襄阳': '湖北省', '襄阳市': '湖北省', '鄂州': '湖北省', '鄂州市': '湖北省',
  '荆门': '湖北省', '荆门市': '湖北省', '孝感': '湖北省', '孝感市': '湖北省',
  '荆州': '湖北省', '荆州市': '湖北省', '黄冈': '湖北省', '黄冈市': '湖北省',
  '咸宁': '湖北省', '咸宁市': '湖北省', '随州': '湖北省', '随州市': '湖北省',
  '恩施': '湖北省', '恩施市': '湖北省',
  '长沙': '湖南省', '长沙市': '湖南省', '株洲': '湖南省', '株洲市': '湖南省',
  '湘潭': '湖南省', '湘潭市': '湖南省', '衡阳': '湖南省', '衡阳市': '湖南省',
  '邵阳': '湖南省', '邵阳市': '湖南省', '岳阳': '湖南省', '岳阳市': '湖南省',
  '常德': '湖南省', '常德市': '湖南省', '张家界': '湖南省', '张家界市': '湖南省',
  '益阳': '湖南省', '益阳市': '湖南省', '郴州': '湖南省', '郴州市': '湖南省',
  '永州': '湖南省', '永州市': '湖南省', '怀化': '湖南省', '怀化市': '湖南省',
  '娄底': '湖南省', '娄底市': '湖南省',
  '广州': '广东省', '广州市': '广东省', '韶关': '广东省', '韶关市': '广东省',
  '深圳': '广东省', '深圳市': '广东省', '珠海': '广东省', '珠海市': '广东省',
  '汕头': '广东省', '汕头市': '广东省', '佛山': '广东省', '佛山市': '广东省',
  '江门': '广东省', '江门市': '广东省', '湛江': '广东省', '湛江市': '广东省',
  '茂名': '广东省', '茂名市': '广东省', '肇庆': '广东省', '肇庆市': '广东省',
  '惠州': '广东省', '惠州市': '广东省', '梅州': '广东省', '梅州市': '广东省',
  '汕尾': '广东省', '汕尾市': '广东省', '河源': '广东省', '河源市': '广东省',
  '阳江': '广东省', '阳江市': '广东省', '清远': '广东省', '清远市': '广东省',
  '东莞': '广东省', '东莞市': '广东省', '中山': '广东省', '中山市': '广东省',
  '潮州': '广东省', '潮州市': '广东省', '揭阳': '广东省', '揭阳市': '广东省',
  '云浮': '广东省', '云浮市': '广东省',
  '南宁': '广西壮族自治区', '南宁市': '广西壮族自治区', '柳州': '广西壮族自治区', '柳州市': '广西壮族自治区',
  '桂林': '广西壮族自治区', '桂林市': '广西壮族自治区', '梧州': '广西壮族自治区', '梧州市': '广西壮族自治区',
  '北海': '广西壮族自治区', '北海市': '广西壮族自治区', '防城港': '广西壮族自治区', '防城港市': '广西壮族自治区',
  '钦州': '广西壮族自治区', '钦州市': '广西壮族自治区', '贵港': '广西壮族自治区', '贵港市': '广西壮族自治区',
  '玉林': '广西壮族自治区', '玉林市': '广西壮族自治区', '百色': '广西壮族自治区', '百色市': '广西壮族自治区',
  '贺州': '广西壮族自治区', '贺州市': '广西壮族自治区', '河池': '广西壮族自治区', '河池市': '广西壮族自治区',
  '来宾': '广西壮族自治区', '来宾市': '广西壮族自治区', '崇左': '广西壮族自治区', '崇左市': '广西壮族自治区',
  '海口': '海南省', '海口市': '海南省', '三亚': '海南省', '三亚市': '海南省',
  '三沙': '海南省', '三沙市': '海南省', '儋州': '海南省', '儋州市': '海南省',
  '成都': '四川省', '成都市': '四川省', '自贡': '四川省', '自贡市': '四川省',
  '攀枝花': '四川省', '攀枝花市': '四川省', '泸州': '四川省', '泸州市': '四川省',
  '德阳': '四川省', '德阳市': '四川省', '绵阳': '四川省', '绵阳市': '四川省',
  '广元': '四川省', '广元市': '四川省', '遂宁': '四川省', '遂宁市': '四川省',
  '内江': '四川省', '内江市': '四川省', '乐山': '四川省', '乐山市': '四川省',
  '南充': '四川省', '南充市': '四川省', '眉山': '四川省', '眉山市': '四川省',
  '宜宾': '四川省', '宜宾市': '四川省', '广安': '四川省', '广安市': '四川省',
  '达州': '四川省', '达州市': '四川省', '雅安': '四川省', '雅安市': '四川省',
  '巴中': '四川省', '巴中市': '四川省', '资阳': '四川省', '资阳市': '四川省',
  '贵阳': '贵州省', '贵阳市': '贵州省', '六盘水': '贵州省', '六盘水市': '贵州省',
  '遵义': '贵州省', '遵义市': '贵州省', '安顺': '贵州省', '安顺市': '贵州省',
  '毕节': '贵州省', '毕节市': '贵州省', '铜仁': '贵州省', '铜仁市': '贵州省',
  '昆明': '云南省', '昆明市': '云南省', '曲靖': '云南省', '曲靖市': '云南省',
  '玉溪': '云南省', '玉溪市': '云南省', '保山': '云南省', '保山市': '云南省',
  '昭通': '云南省', '昭通市': '云南省', '丽江': '云南省', '丽江市': '云南省',
  '普洱': '云南省', '普洱市': '云南省', '临沧': '云南省', '临沧市': '云南省',
  '拉萨': '西藏自治区', '拉萨市': '西藏自治区', '日喀则': '西藏自治区', '日喀则市': '西藏自治区',
  '昌都': '西藏自治区', '昌都市': '西藏自治区',
  '西安': '陕西省', '西安市': '陕西省', '铜川': '陕西省', '铜川市': '陕西省',
  '宝鸡': '陕西省', '宝鸡市': '陕西省', '咸阳': '陕西省', '咸阳市': '陕西省',
  '渭南': '陕西省', '渭南市': '陕西省', '延安': '陕西省', '延安市': '陕西省',
  '汉中': '陕西省', '汉中市': '陕西省', '榆林': '陕西省', '榆林市': '陕西省',
  '安康': '陕西省', '安康市': '陕西省', '商洛': '陕西省', '商洛市': '陕西省',
  '兰州': '甘肃省', '兰州市': '甘肃省', '嘉峪关': '甘肃省', '嘉峪关市': '甘肃省',
  '金昌': '甘肃省', '金昌市': '甘肃省', '白银': '甘肃省', '白银市': '甘肃省',
  '天水': '甘肃省', '天水市': '甘肃省', '武威': '甘肃省', '武威市': '甘肃省',
  '张掖': '甘肃省', '张掖市': '甘肃省', '平凉': '甘肃省', '平凉市': '甘肃省',
  '酒泉': '甘肃省', '酒泉市': '甘肃省', '庆阳': '甘肃省', '庆阳市': '甘肃省',
  '定西': '甘肃省', '定西市': '甘肃省', '陇南': '甘肃省', '陇南市': '甘肃省',
  '西宁': '青海省', '西宁市': '青海省', '海东': '青海省', '海东市': '青海省',
  '银川': '宁夏回族自治区', '银川市': '宁夏回族自治区', '石嘴山': '宁夏回族自治区', '石嘴山市': '宁夏回族自治区',
  '吴忠': '宁夏回族自治区', '吴忠市': '宁夏回族自治区', '固原': '宁夏回族自治区', '固原市': '宁夏回族自治区',
  '中卫': '宁夏回族自治区', '中卫市': '宁夏回族自治区',
  '乌鲁木齐': '新疆维吾尔自治区', '乌鲁木齐市': '新疆维吾尔自治区', '克拉玛依': '新疆维吾尔自治区', '克拉玛依市': '新疆维吾尔自治区',
  '吐鲁番': '新疆维吾尔自治区', '吐鲁番市': '新疆维吾尔自治区', '哈密': '新疆维吾尔自治区', '哈密市': '新疆维吾尔自治区',
  '全国': '全国', '中国': '全国', '全部': '全国'
}

// ==================== 时间范围处理 ====================
const handleTimeRangeChange = () => {
  if (timeRange.value === 'custom') {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    if (!customStartDate.value) {
      customStartDate.value = sevenDaysAgo.toISOString().split('T')[0]
    }
    if (!customEndDate.value) {
      customEndDate.value = today.toISOString().split('T')[0]
    }
  }
}

// 根据时间范围获取 startTime / endTime
const getTimeParams = () => {
  const now = new Date()
  const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  let startTime, endTime
  endTime = toDateStr(now) + ' 23:59:59'

  switch (timeRange.value) {
    case 'today': {
      startTime = toDateStr(now) + ' 00:00:00'
      break
    }
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - 6)
      startTime = toDateStr(d) + ' 00:00:00'
      break
    }
    case 'month': {
      const d = new Date(now)
      d.setDate(d.getDate() - 29)
      startTime = toDateStr(d) + ' 00:00:00'
      break
    }
    case 'custom': {
      if (customStartDate.value) {
        startTime = customStartDate.value + ' 00:00:00'
      }
      if (customEndDate.value) {
        endTime = customEndDate.value + ' 23:59:59'
      }
      break
    }
  }
  return { startTime, endTime }
}

// ==================== 文章监测查询 ====================
const handleSearch = async () => {
  loading.value = true
  try {
    const { startTime, endTime } = getTimeParams()
    const levelArray = [0, 1, 2, 3].map(i => sensitivityLevel.value.includes(String(i)) ? 1 : 0)

    const res = await getMonitorArticleAPI({
      startTime,
      endTime,
      sensitivityLevel: levelArray,
      source: source.value || '',
      region: region.value || '',
      keyWord: keyword.value || ''
    })

    if (res.code === 1) {
      articleList.value = res.data?.dataList || []
      articleTotal.value = articleList.value.length
    } else {
      ElMessage.error(res.msg || '查询失败')
      articleList.value = []
      articleTotal.value = 0
    }
  } catch (err) {
    console.error('文章监测查询失败:', err)
    ElMessage.error('网络异常，请重试')
    articleList.value = []
    articleTotal.value = 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  timeRange.value = 'today'
  customStartDate.value = ''
  customEndDate.value = ''
  sensitivityLevel.value = ['0', '1', '2', '3']
  source.value = ''
  region.value = ''
  keyword.value = ''
  articleList.value = []
  articleTotal.value = 0
  articlePageNum.value = 1
  articlePageSize.value = 20
}

// ==================== 辅助方法 ====================
const sensitivityTagType = (level) => {
  switch (level) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'danger'
    case 3: return 'danger'
    default: return 'info'
  }
}

const sensitivityLabel = (level) => {
  switch (level) {
    case 0: return '普通'
    case 1: return '低敏感'
    case 2: return '中敏感'
    case 3: return '高敏感'
    default: return '未知'
  }
}

const sentimentTagType = (type) => {
  switch (type) {
    case 1: return 'success'
    case 0: return 'info'
    case -1: return 'danger'
    default: return 'info'
  }
}

const sentimentLabel = (type) => {
  switch (type) {
    case 1: return '正面'
    case 0: return '中性'
    case -1: return '负面'
    default: return '未知'
  }
}

// ==================== 统计图表 ====================
const buildRegionRank = () => {
  const regionMap = {}
  articleList.value.forEach((item) => {
    if (!item.region) return
    regionMap[item.region] = (regionMap[item.region] || 0) + 1
  })
  const sorted = Object.entries(regionMap)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
  return sorted.map((item, idx) => ({
    rank: idx + 1,
    region: item.region,
    count: item.count,
    sensitiveCount: 0
  }))
}

const switchToStatistics = () => {
  activeTab.value = 'statistics'
  const list = articleList.value
  if (!list.length) return
  hasStats.value = true

  statsData.value = {
    totalArticles: list.length,
    sensitiveCount: list.filter(i => [1, 2, 3].includes(i.sensitivityLevel)).length || 0,
    neutralCount: list.filter(i => i.sentimentType === 0).length || 0,
    normalCount: list.filter(i => i.sensitivityLevel === 0).length || 0
  }

  regionRankData.value = buildRegionRank()

  nextTick(() => {
    initMap()
    renderCharts()
  })
}

const renderCharts = () => {
  renderSourceChart()
  renderTrendChart()
  renderSensitivityChart()
  renderSentimentChart()
}

const renderSourceChart = () => {
  if (!sourceChartRef.value) return
  if (sourceChartInstance) sourceChartInstance.dispose()
  sourceChartInstance = echarts.init(sourceChartRef.value)
  const map = {}
  articleList.value.forEach(i => { const s = i.source || '未知'; map[s] = (map[s] || 0) + 1 })
  const data = Object.entries(map).map(([name, value]) => ({ name, value }))
  sourceChartInstance.setOption({
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['35%', '60%'], data, label: { formatter: '{b}: {d}%' } }]
  })
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  if (trendChartInstance) trendChartInstance.dispose()
  trendChartInstance = echarts.init(trendChartRef.value)
  const dayMap = {}
  articleList.value.forEach(i => {
    if (i.publishTime) {
      const d = i.publishTime.substring(0, 10)
      dayMap[d] = (dayMap[d] || 0) + 1
    }
  })
  const dates = Object.keys(dayMap).sort()
  const counts = dates.map(d => dayMap[d])
  trendChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: counts, smooth: true, areaStyle: { opacity: 0.3 } }]
  })
}

const renderSensitivityChart = () => {
  if (!sensitivityChartRef.value) return
  if (sensitivityChartInstance) sensitivityChartInstance.dispose()
  sensitivityChartInstance = echarts.init(sensitivityChartRef.value)
  const levels = ['普通', '低敏感', '中敏感', '高敏感']
  const counts = [0, 0, 0, 0]
  articleList.value.forEach(i => {
    const l = i.sensitivityLevel
    if (l >= 0 && l <= 3) counts[l]++
  })
  sensitivityChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: levels },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar', data: counts,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' }, { offset: 1, color: '#188df0' }
        ])
      }
    }]
  })
}

const renderSentimentChart = () => {
  if (!sentimentChartRef.value) return
  if (sentimentChartInstance) sentimentChartInstance.dispose()
  sentimentChartInstance = echarts.init(sentimentChartRef.value)
  let pos = 0, neu = 0, neg = 0
  articleList.value.forEach(i => {
    if (i.sentimentType === 1) pos++
    else if (i.sentimentType === 0) neu++
    else if (i.sentimentType === -1) neg++
  })
  sentimentChartInstance.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie', radius: ['35%', '60%'],
      data: [
        { name: '正面', value: pos },
        { name: '中性', value: neu },
        { name: '负面', value: neg }
      ],
      label: { formatter: '{b}: {d}%' }
    }]
  })
}

const initMap = () => {
  if (!chinaMapRef.value) return
  if (mapChart) mapChart.dispose()
  mapChart = echarts.init(chinaMapRef.value)
  echarts.registerMap('china', chinaJson)
  if (!regionRankData.value.length) return
  const regionMap = {}
  regionRankData.value.forEach((item) => {
    const name = cityToProvinceMap[item.region] || item.region
    const value = Number(item.count) || 0
    if (name && value > 0) {
      regionMap[name] = (regionMap[name] || 0) + value
    }
  })
  const mapData = Object.entries(regionMap).map(([name, value]) => ({ name, value }))
  const maxValue = Math.max(...mapData.map(d => d.value), 10)
  mapChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}<br/>发文量: {c}' },
    visualMap: {
      min: 0, max: maxValue, text: ['高', '低'],
      realtime: false, calculable: true,
      inRange: { color: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350'] },
      left: 'left', bottom: '10%'
    },
    series: [{
      type: 'map', map: 'china', roam: true,
      itemStyle: { areaColor: '#f3f3f3', borderColor: '#999' },
      emphasis: { label: { show: true }, itemStyle: { areaColor: '#ffd700' } },
      data: mapData
    }]
  })
}

// ==================== 标签页切换 ====================
const handleTabChange = (name) => {
  if (name === 'statistics' && hasStats.value) {
    nextTick(() => { initMap(); renderCharts() })
  }
}

// ==================== 文章详情 ====================
const viewArticleDetail = (row) => {
  detailData.value = row
  detailVisible.value = true
}

const openUrl = (url) => {
  window.open(url, '_blank')
}

const loadSources = async () => {
  try {
    const res = await searchAllSourceAPI()
    if (res.code === 1) {
      sourceList.value = res.data || []
    }
  } catch (err) {
    console.error('获取文章来源列表失败:', err)
  }
}

const handleResize = () => {
  sourceChartInstance?.resize()
  trendChartInstance?.resize()
  sensitivityChartInstance?.resize()
  sentimentChartInstance?.resize()
  mapChart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadSources()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  sourceChartInstance?.dispose()
  trendChartInstance?.dispose()
  sensitivityChartInstance?.dispose()
  sentimentChartInstance?.dispose()
  if (mapChart) mapChart.dispose()
})
</script>

<style scoped>
.monitor-page {
  padding: 0;
}

.filter-panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.filter-row:last-of-type {
  margin-bottom: 0;
}

.filter-label {
  min-width: 100px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.tab-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-count {
  font-size: 14px;
  color: #666;
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

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ===== 统计图表 ===== */
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

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #409eff;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  width: 30px;
  height: 30px;
  background: #f5f7fa;
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

.stat-card.card-blue .stat-value { color: #409eff; }
.stat-card.card-purple .stat-value { color: #9c27b0; }
.stat-card.card-orange .stat-value { color: #ff9800; }
.stat-card.card-green .stat-value { color: #4caf50; }

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

/* ===== 四张图表 ===== */
.chart-row {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.chart-card {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}

.chart-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.chart-box {
  height: 320px;
}

/* ===== 文章详情对话框 ===== */
.detail-content {
  padding: 0 8px;
}

.detail-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 12px 0;
}

.detail-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
}

.detail-body {
  font-size: 14px;
  color: #555;
  line-height: 1.8;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-link {
  margin-top: 16px;
}

.detail-link a {
  color: #409eff;
  text-decoration: none;
}

.detail-link a:hover {
  text-decoration: underline;
}
</style>
