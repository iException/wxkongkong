const kPageSize = 10
const kEdgeInteval = 14
const vSectionInteval = 10
var app = getApp()
let config = require("../../config.js")
let router = require("../../utils/router.js")
let routerfactory = require("../../utils/routerfactory.js")
var pagelayout = require("../../datamanager/pagelayout.js")
var addatamanager = require("../../datamanager/addatamanager.js")

Page({
  data: {
    edgeInteval: kEdgeInteval,
    activityItems: undefined,//活动
    categoryItems: [],//类别
    topicItems: [],//晒单专区
    celebrityItem: undefined,//大咖
    items: [],//ad items.
    windowHeight: 400,
    hasMore: false,//是否还有更多数据可以加载.
    loadingDataError: false
  },
  customerData: {
    SV: 1,
    loadingIdx: 0,
    selectedctgindex: 0,//当前选择的index.
    isloadingMore: false,//是否正在加载跟多中...
    lastestads: [], //最新交易列表
    lastestadIndex: 0,
    isFirstLoading: true,
    isBeginedAnimteLastestAds: false,
    windowWidth: 375,
    isInTrasition: false
  },
  onReady: function() {
    this.reloadDatas()
  },
  onShow: function(){
    // 页面显示
    var that = this
    wx.getSystemInfo( {
      success: ( res ) => {
        that.setData( {
          windowHeight: res.windowHeight
        })
      }
    })
    this.customerData.isInTrasition = false
  },
  onReachBottom: function() {
    if (!this.customerData.isloadingMore && this.data.hasMore) {
      this.customerData.isloadingMore = true
      this.loadMoreAdItemsWithMode(false)
    }
  },
  reloadDatas: function() {
    this.showloadingView()
    this.onPullDownRefresh()
  },
  showloadingView: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 100000
    })
  },
  //下拉刷新
  onPullDownRefresh: function() {
    if (this.customerData.isloadingMore) {
      wx.stopPullDownRefresh()
      return 
    }
    this.customerData.isloadingMore = true
    this.resetLoadAdDataPrams()
    let that = this
    let params = this.pageLayoutParams()
    let success = this.loadPlageyoutDataSuccess
    let fail = this.loadPlageyoutDataSuccessFailed
    let complete = function() {
      wx.stopPullDownRefresh()
    }
    pagelayout.getPageLayout(params, success, fail, complete)
  },
  pageLayoutParams: function() {
    return {
      SV: '4',
      id: '0',
      opts: '',
      channel: 'quanbu'
    }
  },
  resetLoadAdDataPrams: function() {
    this.setData({
      loadingDataError: false
    })
    this.customerData.loadingIdx = 0
  },
  loadPlageyoutDataSuccess: function(items) {
    wx.hideToast()
    this.customerData.isFirstLoading = false

    this.setData({
      activityItems: items["activityItems"],
      categoryItems: items["categoryItems"],
      topicItems: items["topicItems"],
      celebrityItem: items["celebrityItem"]
    })

    let lastestItems = items["lastestItems"]
    this.customerData.lastestads = lastestItems
    if (lastestItems && lastestItems.length && !this.customerData.isBeginedAnimteLastestAds) {
      this.customerData.isBeginedAnimteLastestAds = true
      this.beginbeginExchangeLastestAdInfo()
    }

    //加载ad列表信息
    var that = this
    setTimeout(function(){
      that.loadMoreAdItemsWithMode(true)
    }, 500)
  },
  loadPlageyoutDataSuccessFailed() {
    //如果无数据，加载失败，显示点击重新加载，按钮.
    wx.showToast({
      title: "加载数据失败...",
      duration: 2000
    })

    this.customerData.isloadingMore = false

    if (this.customerData.isFirstLoading) {
      this.setData({
        loadingDataError: true
      })
    }
  },
  //加载更多首页ads
  loadMoreAdItemsWithMode: function(refreshMode) {
    var that = this
    let params = this.loadMoreAdItemParams()
    let success = function(items) {
      that.loadMoreAdItemsSuccess(refreshMode, items)
    }
    let complete = function() {
      setTimeout(function() {
          that.customerData.isloadingMore = false
      }, 1000)
    }
    addatamanager.getMorePageLayoutAdItems(params, success, null, complete)
  },
  loadMoreAdItemParams: function() {
    let opts = {
      "from" : kPageSize * this.customerData.loadingIdx,
      "size" : kPageSize,
      "banner": false
    }
    let params = {
      SV: this.customerData.SV,
      opts: JSON.stringify(opts)
    }
    return params;
  },
  loadMoreAdItemsSuccess(isRefresh ,retItems) {
    //处理加载数据
    if (isRefresh) {
      this.data.items = []
    }
    this.customerData.loadingIdx += 1

    var items = this.data.items
    items = items.concat(retItems)

    var hasMore = retItems.length >= kPageSize
    this.setData({
      items: items,
      hasMore: hasMore
    })
  },
  beginbeginExchangeLastestAdInfo: function() {
    this.customerData.lastestadIndex += 1
    if (this.customerData.lastestadIndex >= this.customerData.lastestads.length) {
      this.customerData.lastestadIndex = 0
    }
    this.setData({
      lastestItem: this.customerData.lastestads[this.customerData.lastestadIndex]
    })

    var that = this
    setTimeout(function(){
      //加载ad列表信息
      that.beginbeginExchangeLastestAdInfo()
    }, 5000)
  },
  clickOnBannerIntroView: function() {

  },
  clickOnCategoryView: function(e) {
    if (this.customerData.isInTrasition) {
      return
    }
    this.customerData.isInTrasition = true

    var tag = this.data.categoryItems[e.currentTarget.dataset.tag]
    var url = "../zone/zone?keyword=" + tag.title
    wx.navigateTo({
      url: url
    })
  },
  clickOnLastestView: function(e) {
    if (this.customerData.isInTrasition) {
      return
    }
    this.customerData.isInTrasition = true

    wx.navigateTo({
      url: '../lastestads/lastestads'
    })
  },
  clickOnTopicView: function(e) {
    if (this.customerData.isInTrasition) {
      return
    }
    this.customerData.isInTrasition = true

    let url = '../topiclist/topiclist?themeId=1'
    wx.navigateTo({
      url: url
    })
  },
  clickCheckMoreCelebritys: function(e) {

  },
  clickSearchAds: function(e) {
    if (this.customerData.isInTrasition) {
      return
    }
    this.customerData.isInTrasition = true

    wx.navigateTo({
      url: "../adsearch/adsearch"
    })
  },
  clickOnCelebrityView: function(e) {
    if (this.customerData.isInTrasition) {
      return
    }
    this.customerData.isInTrasition = true

    let index = e.currentTarget.dataset.index - 0
    let item = this.data.celebrityItem.items[index]
    if (item.action) {
      let url = item.action
      url = url.replace("lkk://", "")
      url = url.replace("/", "")
      url = "../celebrityad/" + url
      wx.navigateTo({
        url: url
      })
    }
  },
  clickOnAdView: function(e) {
    if (this.customerData.isInTrasition) {
      return
    }
    this.customerData.isInTrasition = true

    //点击adView
    var idx = e.currentTarget.dataset.index - 0
    var adInfo = this.data.items.length > idx && this.data.items[idx]
    if (adInfo) {
      this.gotoAdDetailView(adInfo.content)
    }
  },
  gotoAdDetailView: function(adInfo) {
    app.globalData.adInfo = adInfo
    let url = routerfactory.adDetailRouterUrl(adInfo.id)
    router.openUrl(url)
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: config.shareTitle, // 分享标题
      desc: config.shareDesc, // 分享描述
      path: config.sharePath // 分享路径
    }
  },
  clickOnIntroBanner: function() {
    wx.showModal({
      title: config.downloadTitle,
      content: config.downloadContent,
    })
  }
})