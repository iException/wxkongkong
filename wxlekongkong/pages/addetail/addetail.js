const vInteval = 10
const hInteval = 14
const kPageSize = 30
var app = getApp()
var config = require("../../config.js")
var util = require("../../utils/util.js")
var apimanager = require("../../utils/apimanager.js")
let imagehelper = require("../../utils/imagehelper.js")
let applicant = require("../../datamanager/applicants.js")
let addatamanager = require("../../datamanager/addatamanager.js")

Page({
  data:{
    userInfo: undefined, //poster信息
    images: [], //ad图片
    tags: [], //ad的标签
    date: "", //ad日期
    city: "", //poster地址
    likers: [], //点赞的用户
    likeCount: 0,
    description: "", //ad描述
    readTimes: "",  //阅读次数
    applicationCount: 0,  //申请数量
    winnerInfo: undefined,  //获赠者
    norApplicants: [],      //正常申请者
    hotApplicants: [],      //热门申请
    hasMoreApplicantors: false,//是否有更多申请者
    loadingDataError: false,   //加载是否失败标签
    windowHeight: 400
  },
  customerData: {
    lastId: 0,
    adInfoExist: false,
    isloadingMore: false,
    windowWidth: 375
  },
  onShow: function() {
    var info = app.globalData.adInfo
    if (!info && !this.data.userInfo) {
      let that = this
      setTimeout(function(){
        that.showLoadingAdInfoView()
      }, 500)
    }
    app.globalData.adInfo = null
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.customerData.adId = options['adId']
    try{ 
      var res = wx.getSystemInfoSync()
      this.setData({
        windowHeight: res.windowHeight
      })
      this.customerData.windowWidth = res.windowWidth
    } catch(e) {
      console.log('error');
    }

    var info = app.globalData.adInfo
    //存在ad信息，直接显示页面，否则，先加载.
    if(info) {
      this.updateAdDetailInfo(info)
    }
    this.loadAdDatas()
  },
  onUnload: function() {
    this.setData({
      userInfo: null,
      images: [],
      tags: []
    })
  },
  reloadDatas: function() {
    if (this.customerData.isloadingMore) {
      return
    }
    this.showLoadingAdInfoView()
    this.loadAdDatas()
  },
  showLoadingAdInfoView: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
  },
  hideLoadingAdInfoView: function() {
    wx.hideToast()
  },
  loadAdDatas: function() {
    this.customerData.isloadingMore = true
    let params = this.adDetailInfoParams()
    let success = this.loadAdDetailInfoSuccess
    let fail = this.loadAdDetailInfoFail
    addatamanager.getAdDetailWithParams(params, success, fail, null)
  },
  adDetailInfoParams: function() {
    return {
      adId: this.customerData.adId,
      SV: 3
    }
  },
  loadAdDetailInfoSuccess: function(res) {
    this.hideLoadingAdInfoView()

    var info = res.data.result.display.content
    this.updateAdDetailInfo(info)

    if(info.applicationCount > 0) {
      this.setData({
        hasMoreApplicantors: true
      })
      this.loadMoreApplicants()
    } else {
      this.setData({
        hasMoreApplicantors: false
      })
    }
  },
  loadAdDetailInfoFail: function() {
    if(!this.customerData.adInfoExist) {
      this.setData({
        loadingDataError: true
      })
      this.customerData.isloadingMore = false
      this.loadMoreAdApplicantsFail()
    }
  },
  updateAdDetailInfo: function(info) {
    //如果存在本地adInfo，那么执行copy操作.
    this.customerData.adInfoExist = true
    var images = this.data.images.length == 0 ? imagehelper.calculatedDefaultFlowImagesSize(info.images, hInteval, vInteval, this.customerData.windowWidth) : this.data.images

    if(!info.city){
      info.city = info.region.names.join(" | ")
    }
    if(!info.description) {
      info.description = info.title + info.content
    }
    if(!info.date) {
      let date = new Date(info.createdAt * 1000)
      info.date = util.adFormatTime(date)
    }
    if(!info.user.avatarUrl) {
      info.user.avatarUrl = info.user.avatar.square
    }
    var winnerInfo = this.data.winnerInfo
    if (!winnerInfo && info.chosenApplication) {
       winnerInfo = {
                      width: 240,
                      avatar:info.chosenApplication.applicant.avatar,
                      name: info.chosenApplication.applicant.nick,
                      reason: info.chosenApplication.reason,
                      thanks: info.chosenApplication.thanksLetter && info.chosenApplication.thanksLetter.text,
                      thanksImage: info.chosenApplication.thanksLetter && info.chosenApplication.thanksLetter.image
                    }
    }

    this.setData({
      userInfo: {
        avatar: info.user.avatarUrl,
        name: info.user.nick,
        giveCount: info.user.giveCount,
        appreciatedCount: info.user.appreciatedCount,
      },
      images: images ? images: [],
      tags: info.tags ? info.tags : [],
      date: info.date,
      city: info.city,
      likers: info.likedUsers ? info.likedUsers: [],
      likeCount: info.likeCount,
      description: info.description,
      readTimes: ((info.readTimes?info.readTimes : 1) + "次浏览"),
      applicationCount: info.applicationCount,
      winnerInfo:winnerInfo
    })
  },
  imageLoaded: function(e) {
    if(!e) {
      return;
    }
    var idx = e.currentTarget.dataset.index - 0;
    var images = this.data.images
    if (images.length < idx){
      return;
    }
    //小图不用计算,计算过的不再重新计算
    var image = images[idx]
    if (!image.isBig) {
      return
    }

    image.height = ( e.detail.height / e.detail.width ) * image.width
    this.setData({
      images: images
    })
  },
  scrolltolower: function() {
    //正在加载或者无数据，不在加载.
    if (this.customerData.isloadingMore || !this.data.hasMoreApplicantors) {
      return
    }
    this.customerData.isloadingMore = true
    this.loadMoreApplicants()
  },
  loadMoreApplicants: function() {
    //已经加载，不再继续加载.
    let params = this.loadMoreAdApplicantsParams()
    let success = this.loadMoreAdApplicantsSuccess
    let fail = this.loadMoreAdApplicantsFail
    // let complete = this.loadingDataComplete
    applicant.loadMoreAdApplicants(params, success, fail, null)
  },
  loadMoreAdApplicantsParams: function() {
    var opts = {
      "size" : kPageSize
    }
    var params = {
      adId: this.customerData.adId,
      id: this.customerData.lastId,
      opts: JSON.stringify(opts)
    }
    return params
  },
  loadMoreAdApplicantsSuccess: function(retInfo) {
    let apiInfo = retInfo["apiInfo"]
    this.customerData.lastId = apiInfo["lastId"]

    let lcalHotApts = this.data.hotApplicants
    let lcalNorApts = this.data.norApplicants
    lcalHotApts = lcalHotApts.concat(retInfo["hotApplicants"])
    lcalNorApts = lcalNorApts.concat(retInfo["normalApplicants"])

    this.setData({
      norApplicants: this.needShowBottomLine(lcalNorApts),
      hotApplicants: this.needShowBottomLine(lcalHotApts),
      hasMoreApplicantors: !apiInfo["endFlag"],
    })
  },
  needShowBottomLine: function(applicants) {
    for (let i = 0; i < applicants.length; i++) {
      let item = applicants[i]
      item.isBottom = (i + 1) == applicants.length;
    }
    return applicants
  },
  loadMoreAdApplicantsFail: function() {
    wx.showToast({
      title: "加载数据失败",
      duration: 2000
    })
  },
  loadingDataComplete(isRefresh) {
    var that = this;
    setTimeout(function() {
        that.customerData.isloadingMore = false
    }, 1000)
  },
  thanksimageloaded(e) {
    if(e){
      let winnerInfo = this.data.winnerInfo
      let imgWidth = e.detail.width
      let imgHeight = e.detail.height
      winnerInfo.height = winnerInfo.width * imgHeight / imgWidth
      this.setData({
        winnerInfo: winnerInfo
      })
    }
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: config.shareTitle, // 分享标题
      desc: config.shareDesc, // 分享描述
      path: '/pages/addetail/addetail?adId=' + this.customerData.adId // 分享路径
    }
  },
  clickToLikeAd: function() {
    this.showDownloadAlert()
  },
  clickToCommentAd: function() {
    this.showDownloadAlert()
  },
  clickToApplyAd: function() {
    this.showDownloadAlert()
  },
  showDownloadAlert: function() {
    wx.showModal({
      title: config.downloadTitle,
      content: config.downloadContent,
    })
  }
})