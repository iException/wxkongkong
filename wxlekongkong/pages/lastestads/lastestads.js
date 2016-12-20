let addatamanager = require("../../datamanager/addatamanager.js")
let routerfactory = require("../../utils/routerfactory.js")
let router = require("../../utils/router.js")

Page({
  data:{
    items: []//信息列表.
  },
  customerData: {
    isFirstLoading: true
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.showloadingView()
    this.loadLastestListing()
  },
  showloadingView: function() {
    wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 10000
    });
  },
  loadLastestListing: function() {
    let that = this
    let success = function(items) {
      that.customerData.isFristLoading = false
      that.setData({
        items: items
      })
    }
    let fail = this.loadLastestListingFail
    let complete = function() {
      setTimeout(function() {
        wx.hideToast()
      }, 1000)
    }
    addatamanager.getLastestTradeAds(null, success, fail, complete)
  },
  loadLastestListingFail: function() {
    wx.showToast({
      title: "加载数据失败",
      duration: 2000
    })

    if (this.customerData.isFristLoading) {
      this.setData({
        loadingDataError: true
      })
    }
  },
  loadAdDatas: function() {
    this.setData({
        loadingDataError: false
    })
    this.showloadingView()
    this.loadLastestListing()
  },
  clickOnLastestadcell: function(e) {
    let tag = e.currentTarget.dataset.tag
    let item = this.data.items[tag]
    let url = routerfactory.adDetailRouterUrl(item.display.content.adId)
    router.openUrl(url)
  }
})