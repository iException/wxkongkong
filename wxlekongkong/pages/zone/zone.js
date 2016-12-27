var app = getApp()
const kPageSize = 30
let router = require("../../utils/router.js")
let routerfactory = require("../../utils/routerfactory.js")
var addatamanager = require("../../datamanager/addatamanager.js")

Page({
  data: {
    items: [],
    hasMore: false,
    windowHeight: 375,
    loadingDataError: false
  },
  customerData: {
    tag: "",  //ad标签
    loadingIdx: 0,
    isInLoading: false,
    isFirstLoading: true
  },
  onLoad: function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.customerData.tag = options['keyword']
    this.reloadDatas()
  },
  onReady: function(){
    // 页面渲染完成
    let tagName = this.customerData.tag
    wx.setNavigationBarTitle({
      title: "#" + tagName + "#"
    })
  },
  onShow: function(){
    // 页面显示
    var that = this;
    wx.getSystemInfo( {
      success: ( res ) => {
        that.setData( {
          windowHeight: res.windowHeight
        })
      }
    })
  },
  reloadDatas: function() {
    this.setData({
      loadingDataError: false
    })
    
    this.showLoadingView()
    this.customerData.isInLoading = true
    this.loadMoreAdDatasWithRefreshMode(true)
  },
  onPullDownRefresh: function() {
    this.loadMoreAdDatasWithRefreshMode(true)
  },
  scrolltolower: function(e) {
    if(this.customerData.isInLoading) {
      return
    }
    this.customerData.isInLoading = true
    this.loadMoreAdDatasWithRefreshMode(false)
  },
  loadMoreAdDatasWithRefreshMode: function(isRefresh) {
    if(isRefresh) {
      this.resetLoadAdDataPrams()
    }

    let that = this
    let params = this.loadAdDatasParams()
    let success = function(items) {
      that.loadMoreAdDatasSuccess(isRefresh, items)
    }
    let fail = function() {
      that.loadMoreAdDatasFail(isRefresh)
    }
    let complete = function() {
      setTimeout(function() {
        that.customerData.isInLoading = false
      }, 1000)
    }
    addatamanager.getAdsByTag(params, success, fail, complete)
  },
  resetLoadAdDataPrams: function() {
    this.customerData.loadingIdx = 0;
  },
  loadAdDatasParams: function() {
    var opts = {
      "from" : kPageSize * (this.customerData.loadingIdx + 1),
      "size" : kPageSize,
      "banner": false
    };
    return {
      opts: JSON.stringify(opts),
      tags: this.customerData.tag
    };
  },
  loadMoreAdDatasSuccess: function(isRefresh, retItems) {
    this.hideLoadingView()
    this.customerData.isFirstLoading = false

    //处理加载数据
    if (isRefresh) {
      this.data.items = []
    }
    this.customerData.loadingIdx += 1

    let items = this.data.items
    items = items.concat(retItems)
    this.setData({
      items: items,
      hasMore: (retItems.length >= kPageSize),
    })
  },
  loadMoreAdDatasFail: function(isRefresh) {
    wx.showToast({
      title: "zone加载数据失败",
      duration: 2000
    })

    if (isRefresh && this.customerData.isFirstLoading) {
      this.setData({
        loadingDataError: true
      })
    }
  },
  showLoadingView: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
  },
  hideLoadingView: function() {
    wx.hideToast()
  },
  clickOnAdView: function(e) {
    //点击adView
    var idx = e.currentTarget.dataset.index - 0;
    var adInfo = this.data.items.length > idx && this.data.items[idx];
    if (adInfo) {
      this.gotoAdDetailView(adInfo.content);
    }
  },
  gotoAdDetailView: function(adInfo) {
    app.globalData.adInfo = adInfo
    let url = routerfactory.adDetailRouterUrl(adInfo.id)
    router.openUrl(url)
  }
})