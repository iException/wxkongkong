let addatamanager = require("../../datamanager/addatamanager.js")
let routerfactory = require("../../utils/routerfactory.js")
let router = require("../../utils/router.js")
let config = require("../../config.js")

Page({
  data:{
    items: []//信息列表.
  },
  customerData: {
    isFirstLoading: true,
    needshowLoadingView: true,
    isInTrasition: false
  },
  onShow: function() {
    if (this.customerData.needshowLoadingView && this.data.items.length == 0) {
      let that = this
      setTimeout(function() {
        that.showloadingView()
      }, 500)
    }
    this.customerData.needshowLoadingView = true
    this.customerData.isInTrasition = false
  },
  onHide: function() {
    wx.hideToast()
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.loadLastestListing()
  },
  onUnload: function() {
    this.setData({
      items: []
    })
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
      }, 2000)
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
    if (this.customerData.isInTrasition) {
      return
    }
    this.customerData.isInTrasition = true

    let tag = e.currentTarget.dataset.tag
    let item = this.data.items[tag]
    let url = routerfactory.adDetailRouterUrl(item.display.content.adId)
    router.openUrl(url)
    this.needshowLoadingView = true
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: config.shareTitle, // 分享标题
      desc: config.shareDesc, // 分享描述
      path: '/pages/lastestads/lastestads' // 分享路径
    }
  }
})