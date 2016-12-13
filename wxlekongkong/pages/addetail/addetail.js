const kInteval = 14
const kPageSize = 30
var app = getApp()
var config = require("../../config.js")
var util = require("../../utils/util.js")
var apimanager = require("../../utils/apimanager.js")

Page({
  data:{
    hasMore: true,    //是否有更多数据.
    applicantors: [],
    loadingDataError: false
  },
  customerData: {
    lastId: 0,
    isloadingMore: false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.customerData.adId = options['id']
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
    app.globalData.adInfo=undefined
    //存在ad信息，直接显示页面，否则，先加载.
    if(info) {
      this.updateAdInfo(info)
    } else {
      this.showLoadingAdInfoView()
    }
    this.loadAdDatas()
  },
  onReady:function(){
  },
  showLoadingAdInfoView: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 100000
    })
  },
  hideLoadingAdInfoView: function() {
    wx.hideToast()
  },
  loadAdDatas: function() {
    var url = config.getAdDetailUrl()
    var params = this.loadAdInoParams()
    var that = this
    apimanager.request({
      url: url,
      data: params,
      method: 'GET',
      success: function(res) {
        that.loadAdInfoSuccess(res)
      }, 
      fail: function() {
        that.loadAdInfoFail()
      },
      complete: function() {
        that.hideLoadingAdInfoView()
      }})
  },
  loadAdInoParams: function() {
    return {
      adId: this.customerData.adId,
      SV: 3
    }
  },
  loadAdInfoSuccess: function(res) {
    if(res.data.type != 'data') {
      this.loadAdInfoFail()
      return;
    }

    var info = res.data.result.display.content
    this.updateAdInfo(info)
    if(info.applicationCount > 0) {
      this.loadmoreApplicantors()
    } else {
      this.setData({
        hasMore: false
      })
    }
  },
  loadAdInfoFail: function() {
    var hasInfo = this.customerData.adInfo
    if(!hasInfo) {
      this.setData({
        loadingDataError: true
      })
    }
  },
  updateAdInfo: function(info) {
    //如果存在本地adInfo，那么执行copy操作.
    this.customerData.adInfo = info
    var images
    if(!this.data.images) {
      images = info.images
      for (let i = 0; i < images.length; i++) {
        let image = images[i]
        image.top = i==0? 0 : kInteval * 0.5
        image.isBig = (images.length % 2 == 0) ? (i < 2) : (i < 3)
        if (images.length % 2 == 0) {
          image.left = (i >= 2) && (i % 2 == 1) ? kInteval * 0.5 : kInteval
        } else {
          image.left = (i >= 3) && (i % 2 == 0) ? kInteval * 0.5 : kInteval
        }
      } 
    } else {
      images = this.data.images
    }

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
      description: info.description,
      readTimes: (info.readTimes + "次浏览"),
      applicationCount: info.applicationCount,
      winnerInfo:winnerInfo
    })
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  imageLoaded: function(e) {
    if(!e) {
      return;
    }
    var idx = e.currentTarget.dataset.index - 0;
    var images = this.data.images
    if (images.length < idx ){
      return;
    }
    //计算过的不再重新计算
    var image = images[idx]
    if (image.height) {
      return
    }
    
    var endIdx = 0
    var startIdx = 0

    if (image.isBig) {
      if(images.length < 3) {
        endIdx = images.length
      } else {
        endIdx = images.length % 2 == 0 ? 2 : 3
      }
    } else {
      startIdx = images.length % 2 == 0 ? 2 : 3
      endIdx = images.length
    }

    var viewWidth = 0
    var viewHeight = 0
    var inteval = image.left
    if (image.isBig) {
      viewWidth = this.customerData.windowWidth - inteval * 2
      var imgWidth = e.detail.width
      var imgHeight = e.detail.height
      viewHeight = ( imgHeight / imgWidth ) * viewWidth
    } else {
      viewHeight = viewWidth = (this.customerData.windowWidth - inteval * 2.5) * 0.5;
    }

    for (var i = startIdx; i < endIdx; i++) {
      var img = images[i]
      img.width = viewWidth
      img.height = viewHeight
    }
    this.setData({
      images: images
    })
  },
  scrolltolower: function() {
    //正在加载或者无数据，不在加载.
    this.loadmoreApplicantors()
  },
  loadmoreApplicantors: function() {
    //已经加载，不再继续加载.
    if (this.customerData.isloadingMore || !this.data.hasMore) {
      return
    }
    this.customerData.isloadingMore = true

    var params = this.loadMoreApplicantorsParams()
    var that = this
    apimanager.request({
      url: config.getApplicantorListUrl(),
      data: params,
      method: 'GET',
      success: function(res){
        if(res.data.type == 'data') {
          that.loadmoreApplicantorsSuccess(res.data.result)
        } else {
          that.loadmoreApplicantorsFail()
        }
      },
      fail: function(){
        that.loadmoreApplicantorsFail()
      },
      complete:function() {
        that.loadingDataComplete()
      }
    })
  },
  loadMoreApplicantorsParams: function() {
    var opts = {
      "size" : kPageSize
    };
    var params = {
      adId: this.customerData.adId,
      id: this.customerData.lastId,
      opts: JSON.stringify(opts)
    }
    return params
  },
  loadmoreApplicantorsSuccess: function(res) {
    this.customerData.lastId = res.lastId

    //正常申请者.
    var items = res.items.new
    var applicantors = this.data.applicantors
    if(items.length) {
      items = this.transferApplicantTimeStampToDate(items)
      for(let i = 0; i < items.length; i++) {
        let item = items[i]
        item.isBottom = (i == (items.length-1))
        applicantors.push(items[i])
      }
    }

    //热门申请者.
    var hotItems = res.items.top
    if(hotItems.length) {
      hotItems = this.transferApplicantTimeStampToDate(hotItems)
    }

    this.setData({
      applicantors: applicantors ? applicantors : [],
      topApplicantors: hotItems ? hotItems : [],
      hasMore: !res.endFlag,
    })
  },
  transferApplicantTimeStampToDate: function(items) {
    var applicants = []
    for (let i = 0; i < items.length; i++) {
      var item = items[i]
      var date = new Date(item.createdAt * 1000);
      
      var applicant = {
        avatar: item.applicant.avatar,
        name: item.applicant.nick,
        date: util.adFormatTime(date),
        reason: item.reason 
      }
      applicants.push(applicant)
    }
    return applicants
  },
  loadmoreApplicantorsFail: function() {
    wx.showToast({
      title: "加载数据失败",
      duration: 2000
    })
  },
  loadingDataComplete(isRefresh) {
    var that = this;
    setTimeout(function() {
        that.customerData.isloadingMore = false;
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
  }
})