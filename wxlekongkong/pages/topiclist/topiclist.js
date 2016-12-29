const hInteval = 5
const vInteval = 5
const kPageSize = 30
const kEdgeInteval = 14
var app = getApp()
let config = require("../../config.js")
let imageHelper = require("../../utils/imagehelper.js")
let topicDataManager = require("../../datamanager/topicdatamanager.js")

Page({
  data:{
    topics: [],
    showNoDatas: false,
    hasMoreTopic: false,
    loadingDataError: false,
    windowHeight: 600,
    edgeInteval: kEdgeInteval
  },
  customerData: {
    themeId: "1",
    lastTopicId: "0",
    isLoadingMoreTopics: false,
    isFirstLoadingTopics: true,
    windowWidth: 375,
    needShowLoadingView: true,
    isInTrasition: false,
  },
  onShow: function() {
    if (this.customerData.needShowLoadingView && this.data.topics.length == 0) {
      let that = this
      setTimeout(function() {
        that.showLoadingView()
      }, 500)
    }
    this.customerData.needShowLoadingView = true
    this.customerData.isInTrasition = false
  },
  onHide: function() {
    wx.hideToast()
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    try{ 
      var res = wx.getSystemInfoSync()
      this.setData({
        windowHeight: res.windowHeight
      })
      this.customerData.windowWidth = res.windowWidth
    } catch(e) {
    }

    this.customerData.themeId = options["themeId"]
  },
  onUnload: function() {
    this.setData({
      topics: []
    })
  },
  onReady: function() {
    wx.setNavigationBarTitle({
      title: '#晒单专区#'
    })
    this.reloadDatas()
  },
  reloadDatas: function() {
    this.setData({
      hasMoreTopic: true,
      loadingDataError: false
     })
    this.showLoadingView()
    this.loadMoreTopicsForRefresh(true)
  },
  onReachBottom: function(e) {
    this.loadMoreTopicsForRefresh(false)
  },
  clickOnTopicView: function(e) {
    if (this.customerData.isInTrasition) {
      return
    }
    this.customerData.isInTrasition = true

    let idx = e.currentTarget.dataset.index
    let topics = this.data.topics
    if (topics && topics.length < idx) {
      return
    }

    let topic = topics[idx]
    app.globalData.topicInfo = topic
    let url = "../topicdetail/topicdetail?id=" + topic.id
    wx.navigateTo({
      url: url
    })
    this.needShowLoadingView = true
  },
  showLoadingView: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
  },
  onPullDownRefresh: function() {
    this.loadMoreTopicsForRefresh(true)
  },
  loadMoreTopicsForRefresh: function(isRefresh) {
    let canLoadMoreTopic = this.data.hasMoreTopic && !this.customerData.isLoadingMoreTopics
    if (!canLoadMoreTopic) {
      return
    }
    this.customerData.isLoadingMoreTopics = true

    if (isRefresh) {
      this.resetLoadTopicParams()
    }

    let params = this.loadMoreTopicsParams()
    let that = this
    let success = function(retInfo) {
      that.loadMoreTopicsSuccess(retInfo, isRefresh)
    }
    let fail = function() {
      that.loadMoreTopicsFailed(isRefresh)
    }
    let complete = function() {
      setTimeout(function() {
        that.customerData.isLoadingMoreTopics = false
        wx.stopPullDownRefresh()
        wx.hideToast()
      }, 2000)
    }
    topicDataManager.loadMoreTopicsWithParams(params, success, fail, complete)
  },
  loadMoreTopicsParams: function() {
    let opts = {
      size: kPageSize
    }
    return {
      id: this.customerData.lastTopicId,
      themeId: this.customerData.themeId,//表示我的帖子.
      opts: JSON.stringify(opts)
    }
  },
  resetLoadTopicParams: function() {
    this.setData({
      hasMoreTopics: false
    })
    this.customerData.lastTopicId = "0"
  },
  loadMoreTopicsSuccess: function(retInfo, isRefresh) {
    if (isRefresh) {
      if (this.customerData.isFirstLoadingTopics) {
        this.customerData.isFirstLoadingTopics = false
      }
    }

    let apiInfo = retInfo["apiInfo"]
    this.customerData.lastTopicId = apiInfo.id

    let lcalTopic = isRefresh ? [] : this.data.topics
    let newTopics = retInfo["items"]
    for (let i = 0; i < newTopics.length; i++) {
      let topic = newTopics[i]
      imageHelper.calculateDefaultTopicImagesSize(topic.images, kEdgeInteval, hInteval, vInteval, this.customerData.windowWidth)
    }    
    lcalTopic = lcalTopic.concat(newTopics)

    this.setData({
      topics: lcalTopic,
      hasMoreTopic: !apiInfo.endFlag,
      showNoDatas: (!lcalTopic || lcalTopic.length==0)
    })
  },
  loadMoreTopicsFailed: function(isRefresh) {
    if(isRefresh) {
      if (this.customerData.isFirstLoadingTopics) {
        this.setData({
          loadingDataError: true
        })
      }
    }
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: config.shareTitle, // 分享标题
      desc: config.shareDesc, // 分享描述
      path: config.sharePath // 分享路径
    }
  }
})