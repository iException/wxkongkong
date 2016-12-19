const kInteval = 14
const kPageSize = 30
var celebrityDm = require("../../datamanager/celebrity.js")
var applicantsDm = require("../../datamanager/applicants.js")

Page({
  data:{
    adInfo: undefined,
    hasMore: true,
    loadingDataError: false
  },
  customerData: {
    //视频播放控件.
    adId: "0",
    isloadingMoreApplicants: true,
    videoContext: undefined,
    lastApplicantId: 0,
    hasMoreApplicant: true,
    windowWidth: 375,
    topApplicants: [],
    newApplicants: []
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
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  //加载失败，重新加载.
  reloadDatas: function() {
    this.setData({
      loadingDataError: false
    })
    this.showLoadingView()
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
    let images = res.images
    for (let i = 0; i < images.length; i++) {
      let image = images[i]
      image.top = i==0 ? 0 : kInteval
      image.isBig = (images.length % 2 == 0) ? (i < 2) : (i < 3)
      if (images.length % 2 == 0) {
        image.left = (i >= 2) && (i % 2 == 1) ? kInteval : kInteval
      } else {
        image.left = (i >= 3) && (i % 2 == 0) ? kInteval : kInteval
      }
    }
    res.images = images

    this.setData({
      adInfo: res
    })
  },
  loadCelebrityItemFail: function(err) {
    this.setData({
      loadingDataError: true
    })
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
    if (this.data.hasMore || this.customerData.isloadingMoreApplicants) {
      return
    }
    this.customerData.isloadingMoreApplicants = true
    let params = this.loadMoreApplicantParams()
    let success = this.loadMoreApplicantSuccess
    let fail = this.loadMoreApplicantFailed
    let complete = this.loadMoreApplicantComplete
    applicantsDm.loadMoreAdApplicants({params: params, success: success, fail: fail, complete: complete})
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
  loadMoreApplicantSuccess: function(applicants) {
    let apiInfo = applicants.apiInfo
    if (!apiInfo) {
      apiInfo = {
        lastApplicantId: "0",
        endFlag: true
      }
    }
    this.customerData.lastApplicantId = apiInfo.lastId 
    this.setData({
      hasMore: !apiInfo.endFlag
    })

    let topApts = applicants.topApplicants
    if (topApts && topApts.length) {
      let lcalApts = this.data.topApplicants
      lcalApts = lcalApts.concat(topApts)
      this.setData({
        topApplicants: lcalApts
      })
    }

    let newApts = applicants.newApplicants
    if (newApts && newApts.length) {
      let lcalApts = this.data.newApplicants
      lcalApts = lcalApts.concat(newApts)
      this.setData({
        newApplicants: lcalApts
      })
    }
  },
  //加载更多申请者成功.
  loadMoreApplicantFailed: function(err) {
    this.showLoadErrorAlert(err)
  },
  loadMoreApplicantComplete: function(err) {
    var that = this
    setTimeout(function() {
      that.customerData.isloadingMoreApplicants = false
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
    var images = this.data.adInfo.images
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
      viewHeight = viewWidth = (this.customerData.windowWidth - inteval * 3) * 0.5;
    }

    for (var i = startIdx; i < endIdx; i++) {
      var img = images[i]
      img.width = viewWidth
      img.height = viewHeight
    }

    var that = this
    this.setData({
      adInfo: that.data.adInfo
    })
  }
})