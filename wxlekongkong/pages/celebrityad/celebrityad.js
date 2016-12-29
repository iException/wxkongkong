const vInteval = 10
const hInteval = 14
const kPageSize = 30
let config = require("../../config.js")
let imagehelper = require("../../utils/imagehelper.js")
let celebrityDm = require("../../datamanager/celebrity.js")
let applicantsDm = require("../../datamanager/applicants.js")

Page({
  data:{
    adInfo: undefined,
    hasMore: false,
    loadingDataError: false,
    windowHeight: 600,
    norApplicants: [],
    hotApplicants: []
  },
  customerData: {
    //视频播放控件.
    adId: "0",
    isloadingMore: false,
    videoContext: undefined,
    lastApplicantId: 0,
    windowWidth: 375,
    isFirstLoading: true
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
    this.reloadDatas()
  },
  onReady:function(){
    // 页面渲染完成
    this.customerData.videoContxt = wx.createVideoContext('video')
  },
  //加载失败，重新加载.
  reloadDatas: function() {
    this.setData({
      loadingDataError: false
    })
    this.customerData.isLoadingMore = true
    this.showLoadingView()
    this.loadCelebrityItem()
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
  //加载celebrityItem
  loadCelebrityItem: function() {
    let params = this.loadCelebrityItemParams()
    let success = this.loadCelebrityItemSuccess
    let fail = this.loadCelebrityItemFail
    let complete = this.loadCelebrityItemComplete
    celebrityDm.getCelebrityItem({params: params, success: success, fail: fail, complete: complete} )
  },
  //加载大咖送需要的参数.
  loadCelebrityItemParams: function() {
    return {
      adId: this.customerData.adId
    }
  },
  //成功加载大咖送.
  loadCelebrityItemSuccess: function(res) {
    this.hideLoadingView()
    this.customerData.isFirstLoading = false

    let images = imagehelper.calculatedDefaultFlowImagesSize(res.images, hInteval, vInteval, this.customerData.windowWidth)
    let image = images[0]
    image.top = 11

    this.setData({
      adInfo: res,
      images: images
    })

    if(res.applicationCount > 0) {
      this.setData({
        hasMore: true
      })
      this.loadMoreApplicants()
    } else {
      this.setData({
        hasMore: false
      })
    }
  },
  loadCelebrityItemFail: function(err) {
    if (this.customerData.isFirstLoading) {
      this.setData({
        loadingDataError: true
      })
    }
    this.showLoadErrorAlert(err)
  },
  loadCelebrityItemComplete: function() {
    let that = this
    setTimeout(function() {
      that.hideLoadingView()
    }, 1000)
  },
  //加载申请者.
  loadMoreApplicants: function() {
    let params = this.loadMoreApplicantParams()
    let success = this.loadMoreApplicantSuccess
    let fail = this.loadMoreApplicantFailed
    let that = this
    let complete = function() {
      that.customerData.isLoadingMore = false
    }
    applicantsDm.loadMoreAdApplicants(params, success, fail, complete)
  },
  //加载申请者参数.
  loadMoreApplicantParams: function() {
    var opts = {
      "size" : kPageSize
    };
    var params = {
      adId: this.customerData.adId,
      id: this.customerData.lastApplicantId,
      opts: JSON.stringify(opts)
    }
    return params
  },
  //成功加载申请者.
  loadMoreApplicantSuccess: function(retInfo) {
    let apiInfo = retInfo["apiInfo"]
    this.customerData.lastApplicantId = apiInfo["lastId"]

    let lcalHotApts = this.data.hotApplicants
    lcalHotApts = lcalHotApts.concat(retInfo["hotApplicants"])

    let lcalNorApts = this.data.norApplicants
    lcalNorApts = lcalNorApts.concat(retInfo["normalApplicants"])

    this.setData({
      norApplicants: this.needShowBottomLine(lcalNorApts),
      hotApplicants: this.needShowBottomLine(lcalHotApts),
      hasMore: !apiInfo["endFlag"],
    })
  },
  needShowBottomLine: function(applicants) {
    for (let i = 0; i < applicants.length; i++) {
      let item = applicants[i]
      item.isBottom = (i + 1) == applicants.length;
    }
    return applicants
  },
  //加载更多申请者成功.
  loadMoreApplicantFailed: function(err) {
    let that = this
    setTimeout(function(){
      that.customerData.isLoadingMore = false
    }, 1000)
  },
  showLoadErrorAlert: function(err) {
    wx.showToast({
      title: "加载数据失败",
      duration: 2000
    })
  },
  //点击播放视频.
  clickPlayVideo: function() {

  },
  //暂停播放视频.
  clickPauseVideo: function() {

  },
  scrolltolower: function() {
    //正在加载或者无数据，不在加载.
    if (!this.data.hasMore || this.customerData.isLoadingMore) {
      return
    }
    this.customerData.isLoadingMore = true
    this.loadMoreApplicants()
  },
  thanksimageloaded(e) {
    if(e){
      let winner = this.data.winner
      let imgWidth = e.detail.width
      let imgHeight = e.detail.height
      winner.height = winner.width * imgHeight / imgWidth
      this.setData({
        winner: winner
      })
    }
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
    //小图、计算过的不再重新计算
    var image = images[idx]
    if (!image.isBig || image.height) {
      return
    }

    image.height = ( e.detail.height / e.detail.width ) * image.width
    this.setData({
      images: images
    })
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: config.shareTitle, // 分享标题
      desc: config.shareDesc, // 分享描述
      path: config.sharePath // 分享路径
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