const kPageSize = 10
var app = getApp()

var pagelayout = require("../../datamanager/pagelayout.js")
var addatamanager = require("../../datamanager/addatamanager.js")

Page({
  data: {
    activityItems: undefined,//活动
    categoryItems: [],//类别
    topicItems: [],//晒单专区
    celebrityItem: undefined,//大咖
    items: [],//ad items.
    windowHeight: 400,
    hasMore: false,//是否还有更多数据可以加载.
    loadingDataError: false,
    firstloadingData: true
  },
  customerData: {
    SV: 1,
    loadingIdx: 0,
    selectedctgindex: 0,//当前选择的index.
    isloadingMore: false,//是否正在加载跟多中...
    lastestads: [], //最新交易列表
    lastestadIndex: 0
  },
  onLoad: function(options){
    // 页面初始化 options为页面跳转所带来的参数
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
  },
  scrolltolower: function(e) {
    if (!this.customerData.isloadingMore) {
      this.loadMoreAdItemsWithMode(false)
    }
  },
  reloadDatas: function() {
    this.showloadingView()
    this.onPullDownRefresh()
  },
  showloadingView: function() {
    if (this.data.firstloadingData) {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 10000
      })
    }
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
    let fail = this.loadingDataFailed
    let complete = function() {
      that.loadingDataComplete(true)
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
    this.setData({
      activityItems: items["activityItems"],
      categoryItems: items["categoryItems"],
      topicItems: items["topicItems"],
      celebrityItem: items["celebrityItem"]
    })

    let lastestItems = items["lastestItems"]
    this.customerData.lastestads = lastestItems
    if (lastestItems && lastestItems.length) {
      this.beginbeginExchangeLastestAdInfo()
    }

    //加载ad列表信息
    var that = this
    setTimeout(function(){
      that.loadMoreAdItemsWithMode(true)
    }, 500)
  },
  //加载跟多首页ads
  loadMoreAdItemsWithMode: function(refreshMode) {
    var that = this
    let params = this.loadMoreAdItemParams()
    let success = function(items) {
      that.loadMoreAdItemsSuccess(refreshMode, items)
    }
    let fail = this.loadingDataFailed
    let complete = function() {
      that.loadingDataComplete(refreshMode)
    }
    addatamanager.getMorePageLayoutAdItems(params, success, fail, complete)
  },
  loadMoreAdItemParams: function() {
    let opts = {
      "from" : kPageSize * (this.customerData.loadingIdx + 1),
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
    wx.hideToast()

    //处理加载数据
    if (isRefresh) {
      this.data.items = []
      if (this.data.firstloadingData) {
        this.setData({
          firstloadingData: false
        })
      }
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
  loadingDataFailed() {
    //如果无数据，加载失败，显示点击重新加载，按钮.
    this.customerData.isloadingMore = false
    wx.showToast({
      title: "加载数据失败",
      duration: 2000
    })
    if (this.data.firstloadingData) {
      this.setData({
        loadingDataError: true
      })
    }
  },
  loadingDataComplete(isRefresh) {
    if (isRefresh) {
      wx.stopPullDownRefresh()
    }
    var that = this
    setTimeout(function() {
        that.customerData.isloadingMore = false
    }, 1000)
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
    var tag = this.data.categoryItems[e.currentTarget.dataset.tag]
    var url = "../zone/zone?keyword=" + tag.title + "&bannerimage=" + tag.bannerimage
    wx.navigateTo({
      url: url
    })
  },
  clickOnLastestView: function(e) {
    wx.navigateTo({
      url: '../lastestads/lastestads'
    })
  },
  clickOnTopicView: function(e) {
    let url = '../topic/topic'
    wx.navigateTo({
      url: url
    })
  },
  clickCheckMoreCelebritys: function(e) {

  },
  clickOnCelebrityView: function(e) {
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
    //点击adView
    var idx = e.currentTarget.dataset.index - 0
    var adInfo = this.data.items.length > idx && this.data.items[idx]
    if (adInfo) {
      this.gotoAdDetailView(adInfo.content)
    }
  },
  gotoAdDetailView: function(adInfo) {
    app.globalData.adInfo = adInfo
    var url = '../addetail/addetail?id=' + adInfo.id 
    wx.navigateTo({
      url: url
    })
  }
})