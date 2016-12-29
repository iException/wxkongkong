const hInteval = 5
const vInteval = 5
const kPageSize = 30
const kEdgeInteval = 14
var app = getApp()
let config = require("../../config.js")
let imageHelper = require("../../utils/imagehelper.js")
let topicDataManager = require("../../datamanager/topicdatamanager.js")
let commentDataManager = require("../../datamanager/commentDataManager.js")

Page({
  data: {
    topic: null,
    windowHeight: 600,
    hasMoreComments: false,
    edgeInteval: kEdgeInteval,
    hotTopicComments: [],
    norTopicComments: [],
    loadingDataError: false
  },
  customerData: {
    topicId: "0",
    lastCommentId: "0",
    isloadingMore: false,
    windowWidth: 375
  },
  onShow: function() {
    var info = app.globalData.topicInfo
    if (!info && !this.data.topic) {
      let that = this
      setTimeout(function(){
        that.showLoadingAdInfoView()
      }, 500)
    }
    app.globalData.topicInfo = null
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    this.updateDeviceInfo()
    this.customerData.topicId = options["id"]
    let topicInfo = app.globalData.topicInfo
    if (topicInfo) {
      this.updateTopicInfo(topicInfo)
    } else {
      this.loadTopicDetailInfo()
    }
  },
  onHide: function() {
    wx.hideToast()
  },
  reloadDatas: function() {
    if (this.customerData.isloadingMore) {
      return
    }
    this.showLoadingAdInfoView()
    this.loadTopicDetailInfo()
  },
  updateTopicInfo: function(topicInfo) {
    if (topicInfo) {
      this.setData({
        topic: topicInfo,
        hasMoreComments: topicInfo.commentCount > 0
      })
    }

    if (topicInfo.commentNum > 0) {
      this.customerData.isloadingMore = true
      this.loadMoreTopicComments()
    }
  },
  loadTopicDetailInfo: function() {
    let that = this
    let params = this.loadTopicDetailInfoParams()
    let success = function(topicInfo) {
      imageHelper.calculateDefaultTopicImagesSize(topicInfo.images, kEdgeInteval, hInteval, vInteval, that.customerData.windowWidth)
      that.updateTopicInfo(topicInfo)
    }
    let fail = function() {
      that.setData({
        loadingDataError: true
      })
      wx.showToast({
        title: "加载数据失败",
        duration: 2000
      })
      that.customerData.isloadingMore = false
    }
    topicDataManager.getTopicDetailWithParams(params, success, fail, null)
  },
  showLoadingAdInfoView: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
  },
  loadTopicDetailInfoParams: function() {
    return { "topicId" : this.customerData.topicId ? this.customerData.topicId : ""}
  },
  scrolltolower: function() {
    //正在加载或者无数据，不在加载.
    if (this.customerData.isloadingMore || !this.data.hasMoreComments) {
      return
    }
    this.customerData.isloadingMore = true
    this.loadMoreTopicComments()
  },
  updateDeviceInfo: function() {
    try{ 
        var res = wx.getSystemInfoSync()
        this.setData({
            windowHeight: res.windowHeight
        })
        this.customerData.windowWidth = res.windowWidth
    } catch(e) {
        console.log('error');
    }
  },
  loadMoreTopicComments: function() {
    let params = this.loadMoreTopicCommentParams()
    let success = this.loadMoreTopicCommentsSuccess
    let that = this
    let complete = function() {
      setTimeout(function() {
        that.customerData.isloadingMore = false
      }, 500)
    }
    commentDataManager.getCommentListWithParams(params, success, null, complete)
  },
  loadMoreTopicCommentParams: function() {
    let opts = {
      size: kPageSize
    }
    return {
      topicId: this.customerData.topicId,
      id: this.customerData.lastCommentId,
      opts: JSON.stringify(opts)
    }
  },
  loadMoreTopicCommentsSuccess: function(retInfo) {
    let apiInfo = retInfo.apiInfo
    this.customerData.lastTopicId = apiInfo.lastId

    let lcalHotComments = this.data.hotTopicComments
    let lcalNorComments = this.data.norTopicComments
    lcalHotComments = lcalHotComments.concat(retInfo.hotComments)
    lcalNorComments = lcalNorComments.concat(retInfo.norComments)
    lcalHotComments = this.updateIsCommentInBottom(lcalHotComments)
    lcalNorComments = this.updateIsCommentInBottom(lcalNorComments)
    this.setData({
      hotTopicComments: lcalHotComments,
      norTopicComments: lcalNorComments,
      hasMoreComments: !apiInfo.endFlag
    })
  },
  updateIsCommentInBottom: function(comments) {
    for (let i = 0; i < comments.length; i++) {
      let comment = comments[i]
      comment.isBottom = (i + 1 == comments.length)
    }
    return comments
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: config.shareTitle, // 分享标题
      desc: config.shareDesc, // 分享描述
      path: '/pages/topicdetail/topicdetail?id=' + this.customerData.topicId // 分享路径
    }
  },
  clickToLikeTopic: function() {
    this.showDownloadAlert()
  },
  clickToCommentTopic: function() {
    this.showDownloadAlert()
  },
  showDownloadAlert: function() {
    wx.showModal({
      title: config.downloadTitle,
      content: config.downloadContent,
    })
  }
})