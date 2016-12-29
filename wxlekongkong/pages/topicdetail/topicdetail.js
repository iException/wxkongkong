const hInteval = 5
const vInteval = 5
const kPageSize = 30
const kEdgeInteval = 14
var app = getApp()
let config = require("../../config.js")
var commentDataManager = require("../../datamanager/commentDataManager.js")

Page({
  data: {
    topic: null,
    windowHeight: 600,
    hasMoreComments: false,
    edgeInteval: kEdgeInteval,
    hotTopicComments: [],
    norTopicComments: []
  },
  customerData: {
    topicId: "",
    lastCommentId: "0",
    isloadingMore: false,
    windowWidth: 375
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    this.updateDeviceInfo()
    this.customerData.topicId = options["id"]
    let topicInfo = app.globalData.topicInfo
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
      path: config.sharePath // 分享路径
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