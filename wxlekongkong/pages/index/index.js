const kPageSize = 30;
var app = getApp();
var config = require("../../config.js");
var util = require("../../utils/util.js");
var apimanager = require("../../utils/apimanager.js");

Page({
  data: {
    items: [],
    windowHeight: 400,
    hasMore: false,//是否还有更多数据可以加载.
    loadingDataError: false,
    firstloadingData: true
  },
  customerData: {
    SV: 1,
    lastId: 0,
    loadingIdx: 0,
    selectedctgindex: 0,//当前选择的index.
    isloadingMore: false,//是否正在加载跟多中...
  },
  onLoad: function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function(){
    // 页面渲染完成
    this.loadAdDatas();
  },
  onShow: function(){
    // 页面显示
    var that = this;
    wx.getSystemInfo( {
      success: ( res ) => {
        that.setData( {
          windowHeight: res.windowHeight
        });
      }
    })
  },
  onHide: function(){
    // 页面隐藏
  },
  onUnload: function(){
    // 页面关闭
  },
  scrolltolower: function(e) {
    if (!this.customerData.isloadingMore) {
      this.loadDataWithType(false);
    }
  },
  loadAdDatas: function() {
    this.showloadingView();
    this.onPullDownRefresh();
  },
  showloadingView: function() {
    if (this.data.firstloadingData) {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 1000000
      })
    }
  },
  onPullDownRefresh: function() {
    //下拉刷新
    if (this.customerData.isloadingMore) {
      wx.stopPullDownRefresh();
      return ;
    }

    this.customerData.isloadingMore = true;
    this.customerData.lastId = 0;
    this.customerData.loadingIdx = 0;
    this.loadDataWithType(true);
  },
  loadDataWithType: function(isRefresh) {
    var that = this;
    var opts = {
      "from" : kPageSize * (this.customerData.loadingIdx + 1),
      "size" : kPageSize,
      "banner": false
    };
    var params = {
      SV: this.customerData.SV,
      id: this.customerData.lastId,
      opts: JSON.stringify(opts)
    };
    console.log(params);
    apimanager.request({
      url: config.getAdListUrl(),
      data: params,
      method: 'GET',
      success: function(res) {
        // success
        wx.hideToast();
        that.loadingDataSuccessed(isRefresh, res.data);
      },
      fail: function() {
        // fail
        that.loadingDataFailed();
      },
      complete: function() {
        // complete
        that.loadingDataComplete(isRefresh);
      }
    });
  },
  loadingDataSuccessed(isRefresh ,res) {
    if (res.type != "data") {
      this.loadingDataFailed();
      return;
    }

    //处理加载数据
    if (isRefresh) {
      this.data.items = []
      this.customerData.items = []

      if (this.data.firstloadingData) {
        this.setData({
          firstloadingData: false
        });
      }
    } else {
      this.customerData.loadingIdx += 1;
    }

    var results = res.result;
    var items = this.data.items;
    for (let key in results) {
      var result = results[key].display;
      if (result.style == "ad_item") {
        var date = new Date(result.content.createdAt * 1000);
        result.content.description = result.content.title + result.content.content;
        result.content.city = result.content.region.names.join("|");
        result.content.date = util.adFormatTime(date);
        result.content.likeCount -= 0;
        result.content.applicationCount -= 0;
        result.content.commentNum -= 0;
        result.style = "HomeRegionListAd";
        items.push(result);
        this.customerData.lastId = result.content.id;
      }
    }

    var hasMore = results.length >= kPageSize;
    this.setData({
      items: items,
      hasMore: hasMore
    });
  },
  loadingDataFailed() {
    //如果无数据，加载失败，显示点击重新加载，按钮.
    wx.showToast({
      title: "加载数据失败",
      duration: 2000
    });
    if (this.data.firstloadingData) {
      this.setData({
        loadingDataError: true
      });
    }
  },
  loadingDataComplete(isRefresh) {
    if (isRefresh) {
      wx.stopPullDownRefresh();
    }
    var that = this;
    setTimeout(function() {
        that.customerData.isloadingMore = false;
      }, 1000);
  },
  clickOnAdView: function(e) {
    //点击adView
    var idx = e.currentTarget.id - 0;
    var adInfo = this.data.items.length > idx && this.data.items[idx];
    if (adInfo) {
      this.gotoAdDetailView(adInfo.content);
    }
  },
  gotoAdDetailView: function(adInfo) {
    app.globalData.adInfo = adInfo;
    wx.navigateTo({
      url: '../vad/addetail'
    });
  }
})