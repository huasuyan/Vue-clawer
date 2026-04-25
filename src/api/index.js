import request from '@/utils/request'

// 获取图形验证码
export const getCaptchaCodeAPI = () => {
  return request({
    url: '/api/v1/auth/getCode',
    method: 'get'
  })
}

// 账号密码登录
export const loginAPI = (data) => {
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    data
  })
}

// 获取短信验证码
export const getSmsCodeAPI = (phone) => {
  return request({
    url: '/api/v1/auth/sendCode',
    method: 'post',
    params: { phone }
  })
}

// 短信验证码登录
export const codeLoginAPI = (data) => {
  return request({
    url: '/api/v1/auth/codeLogin',
    method: 'post',
    data
  })
}

// 用户注册
export const registerAPI = (data) => {
  return request({
    url: '/api/v1/auth/register',
    method: 'post',
    data
  })
}

//删除token
export const delTokenAPI = (data) => {
  return request({
    url: '/api/v1/auth/delToken',
    method: 'post',
    data
  })
}

// 更新用户信息
export const updateUserAPI = (data) => {
  return request({
    url: '/api/v1/user/update',
    method: 'post',
    data
  })
}

// 查询爬虫列表
export const getCrawlerListAPI = (data) => {
  return request({
    url: '/api/v1/crawlers/pageList',
    method: 'post',
    data
  })
}

// 创建爬虫
export const createCrawlerAPI = (data) => {
  return request({
    url: '/api/v1/crawlers/script',
    method: 'post',
    data
  })
}

// 查询单个爬虫信息
export const getCrawlerByIdAPI = (jobId) => {
  return request({
    url: `/api/v1/crawlers/searchByJobId?jobId=${jobId}`,
    method: 'post'
  })
}

// 更新爬虫信息
export const updateCrawlerAPI = (data) => {
  return request({
    url: '/api/v1/crawlers/update',
    method: 'post',
    data
  })
}

// 删除爬虫
export const deleteCrawlerAPI = (jobId) => {
  return request({
    url: `/api/v1/crawlers/delete?jobId=${jobId}`,
    method: 'post'
  })
}

// 手动执行爬虫
export const executeCrawlerAPI = (jobId) => {
  return request({
    url: `/api/v1/crawlers/execute?jobId=${jobId}`,
    method: 'post'
  })
}

// 启用/停止爬虫
export const activateCrawlerAPI = (jobId) => {
  return request({
    url: `/api/v1/crawlers/activate?jobId=${jobId}`,
    method: 'post'
  })
}


// 获取预警专题列表
export const getAlertListAPI = (data) => {
  return request({
    url: '/api/v1/specialAlert/pageList',
    method: 'post',
    data
  })
}

// 创建预警专题
export const createAlertAPI = (data) => {
  return request({
    url: '/api/v1/specialAlert/create',
    method: 'post',
    data
  })
}

// 编辑预警专题
export const editAlertAPI = (data) => {
  return request({
    url: '/api/v1/specialAlert/edit',
    method: 'post',
    data
  })
}

// 根据ID查询预警专题
export const getAlertByIdAPI = (alertId) => {
  return request({
    url: '/api/v1/specialAlert/searchById',
    method: 'get',
    params: { alertId }
  })
}

// 启用/关闭预警专题
export const toggleAlertStateAPI = (alertId) => {
  return request({
    url: '/api/v1/specialAlert/triggerState',
    method: 'get',
    params: { alertId }
  })
}

// 删除预警专题
export const deleteAlertAPI = (alertId) => {
  return request({
    url: '/api/v1/specialAlert/alertDelete',
    method: 'get',
    params: { alertId }
  })
}

// 获取所有预警专题（不分页）
export const searchAllAlertAPI = () => {
  return request({
    url: '/api/v1/specialAlert/searchAllAlert',
    method: 'get'
  })
}

// 统计预警专题数据
export const getAlertStatisticsAPI = (alertId) => {
  return request({
    url: '/api/v1/dataTabulate/specialAlert',
    method: 'get',
    params: { alertId }
  })
}

// 获取舆情信息列表
export const getAlertInfoListAPI = (data) => {
  return request({
    url: '/api/v1/specialAlert/infoList',
    method: 'post',
    data
  })
}

// 删除舆情信息
export const deleteAlertInfoAPI = (newsId) => {
  return request({
    url: '/api/v1/specialAlert/infoDelete',
    method: 'post',
    data: { "newsId": newsId }
  })
}

// 获取部门树
export const getDeptTreeAPI = (params) => {
  return request({
    url: '/api/v1/dept/tree',
    method: 'get',
    params
  })
}

// 搜索部门树
export const searchDeptTreeAPI = (searchName) => {
  return request({
    url: '/api/v1/dept/searchTree',
    method: 'get',
    params: { searchName }
  })
}

// 新增顶级部门（市级局）
export const addTopDeptAPI = (data) => {
  return request({
    url: '/api/v1/dept/addTop',
    method: 'post',
    data
  })
}

// 新增下级部门
export const addChildDeptAPI = (data) => {
  return request({
    url: '/api/v1/dept/addChild',
    method: 'post',
    data
  })
}

// 更新部门信息
export const updateDeptAPI = (data) => {
  return request({
    url: '/api/v1/dept/update',
    method: 'post',
    data
  })
}

// 删除部门
export const deleteDeptAPI = (deptId) => {
  return request({
    url: '/api/v1/dept/delete',
    method: 'get',
    params: { deptId }
  })
}

// 用户条件分页查询
export const getDeptUserListAPI = (params) => {
  return request({
    url: '/api/v1/deptUser/list',
    method: 'get',
    params
  })
}

// 新增用户
export const addDeptUserAPI = (data) => {
  return request({
    url: '/api/v1/deptUser/add',
    method: 'post',
    data
  })
}

// 修改用户
export const updateDeptUserAPI = (data) => {
  return request({
    url: '/api/v1/deptUser/update',
    method: 'post',
    data
  })
}

// 获取用户详情
export const getDeptUserDetailAPI = (userId) => {
  return request({
    url: '/api/v1/deptUser/detail',
    method: 'get',
    params: { userId }
  })
}

// 获取角色下拉列表
export const getRoleDropdownListAPI = () => {
  return request({
    url: '/api/v1/role/dropdownList',
    method: 'get'
  })
}

// 删除用户
export const deleteDeptUserAPI = (userId) => {
  return request({
    url: '/api/v1/deptUser/delete',
    method: 'get',
    params: { userId }
  })
}

// 角色条件分页查询
export const getRolePageListAPI = (data) => {
  return request({
    url: '/api/v1/role/pageList',
    method: 'post',
    data
  })
}

// 分页查询舆情报告专题列表
export const getReportListAPI = (data) => {
  return request({
    url: '/api/v1/specialReport/pageList',
    method: 'post',
    data
  })
}

// 创建舆情报告专题
export const createReportAPI = (data) => {
  return request({
    url: '/api/v1/specialReport/create',
    method: 'post',
    data
  })
}

// 编辑舆情报告专题
export const editReportAPI = (data) => {
  return request({
    url: '/api/v1/specialReport/edit',
    method: 'post',
    data
  })
}

// 删除舆情报告专题
export const deleteReportAPI = (specialReportId) => {
  return request({
    url: '/api/v1/specialReport/delete',
    method: 'get',
    params: { specialReportId }
  })
}

// 获取数据大屏摘要
export const getDashboardSummary = () => {
  return request({ url: '/api/v1/dashboard/summary', method: 'get' })
}
// 获取数据大屏趋势数据
export const getDashboardTrend = (days) => {
  return request({ url: '/api/v1/dashboard/trend', method: 'get', params: { days } })
}
// 获取数据大屏平台数据
export const getDashboardPlatform = (data) => {
  return request({ url: '/api/v1/dashboard/platform', method: 'post', data })
}
// 获取数据大屏区域数据
export const getDashboardRegion = (data) => {
  return request({ url: '/api/v1/dashboard/region', method: 'post', data })
}
// 获取数据大屏热词分析数据
export const getDashboardHotWords = (data) => {
  return request({ url: '/api/v1/dashboard/hotWords', method: 'post', data })
}
// 手动刷新数据大屏数据
export const refreshDashboard = () => {
  return request({ url: '/api/v1/dashboard/refresh', method: 'post' })
}


// 查询舆情报告结果列表
export const getReportResultListAPI = (data) => {
  return request({
    url: '/api/v1/reportResult/pageList',
    method: 'post',
    data
  })
}

// 查询舆情报告详情
export const getReportDetailAPI = (reportId) => {
  return request({
    url: '/api/v1/reportResult/detail',
    method: 'get',
    params: { reportId }
  })
}

// 编辑舆情报告
export const editReportResultAPI = (data) => {
  return request({
    url: '/api/v1/reportResult/edit',
    method: 'post',
    data
  })
}

// 删除舆情报告
export const deleteReportResultAPI = (reportId) => {
  return request({
    url: '/api/v1/reportResult/delete',
    method: 'get',
    params: { reportId }
  })
}
