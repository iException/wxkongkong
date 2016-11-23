var config = require("../../config.js");
var util = require("../../utils/util.js");
var apimanager = require("../../utils/apimanager.js");
const kPageSize = 30;

Page({
  data: {
    windowHeight: 400,
    firstloadingData: true,
    hasMore: false
  },
  customerData: {
    loadingIdx: 0,
    lastId: 0,
    isInLoading: true
  },
  onLoad: function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.customerData.tag = options['keyword'];
    this.customerData.bannerImage = "../../resource/images" + options['bannerimage'];
  },
  onReady: function(){
    // 页面渲染完成
    this.showLoadingView();
    this.loadAdDatasWithType(true);
    wx.setNavigationBarTitle({
      title: this.customerData.keyword
    })
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
  onPullDownRefresh: function() {
    this.loadAdDatasWithType(true);
  },
  scrolltolower: function(e) {
    if (!this.customerData.isloadingMore) {
      this.loadAdDatasWithType(false);
    }
  },
  loadAdDatasWithType: function(isRefresh) {
    if(this.customerData.isInLoading) {
      return;
    }
    this.customerData.isInLoading = true;

    var that = this;
    var url = config.getTagListingUrl();
    var data = this.getLoadAdDatasParams();
    apimanager.request({
      url: url,
      data: data, 
      method: 'GET',
      success: function(ret) {
        that.loadAdDatasSuccess(isRefresh, ret);
      },
      fail: function(){
        that.loadAdDatasFail(isRefresh);
      },
      complete: function(){
        setTimeout(function() {
          that.hideLoadingView();
        }, 1000);
      }});
  },
  getLoadAdDatasParams: function() {
    var opts = {
      "from" : kPageSize * (this.customerData.loadingIdx + 1),
      "size" : kPageSize,
      "banner": false
    };
    return {
      lastId: this.customerData.lastId,
      opts: JSON.stringify(opts),
      tags: this.customerData.tag
    };
  },
  loadAdDatasSuccess: function(isRefresh, ret) {
    if (res.type != "data") {
      this.loadAdDatasFail();
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
        result.content.description = result.content.title + result.content.content;
        result.content.city = result.content.region.names.join("|");
        var date = new Date(result.content.createdAt * 1000);
        result.content.date = util.adFormatTime(date);
        result.content.likeCount -= 0;
        result.content.applicationCount -= 0;
        result.content.commentNum -= 0;
        result.style = "adview";
        items.push(result);
        this.customerData.lastId = result.content.id;
      }
    }

    var hasMore = results.length >= kPageSize;
    var bannerImage = this.customerData.bannerImage;
    this.setData({
      items: items,
      hasMore: hasMore,
      bannerImage: bannerImage
    });
    
  },
  loadAdDatasFail: function(isRefresh) {
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
  showLoadingView: function() {
    if (this.data.firstloadingData) {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 10000
      })
    }
  },
  hideLoadingView: function() {
    wx.hideToast();
  }
})