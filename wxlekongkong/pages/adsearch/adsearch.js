let app = getApp()
const kPageSize = 30
let config = require("../../config.js")
let router = require("../../utils/router.js")
let routerfactory = require("../../utils/routerfactory.js")
let addatamanager = require("../../datamanager/addatamanager.js")

Page({
  data: {
    items: [],
    focus: true,
    showNoDatas: true,
    showSearchView: true,
    hasMore: false,
    windowHeight: 375,
    loadingDataError: false,
    inputTextWidth: 100,
    cancelColor: "#969696",
    categories:["服饰鞋包","家居日用","配件配饰","图书音像","个护美妆","数码产品"],
    categorybuttonwidth: 100,
    searchkeywords:[],
    inputValue: ""
  },
  customerData: {
    searchText: "",  //ad标签
    categoryName:"",
    loadingIdx: 0,
    isInLoading: false,
    isFirstLoading: true,
    isInTrasition: false,
    loadingAdsMode: 0    //0: 关键字搜索，1：热门搜索
  },
  onLoad: function() {
    let that = this
    wx.getStorage({
      key: 'searchkeywords',
      success: function(res){
        // success
        that.setData({
          searchkeywords: res.data
        })
      }
    })
  },
  onShow: function(){
    // 页面显示
    var that = this;
    wx.getSystemInfo( {
      success: ( res ) => {
        that.setData( {
          windowHeight: (res.windowHeight - 50),
          inputTextWidth: res.windowWidth - 158,
          categorybuttonwidth: ((res.windowWidth - 28 - 20 * 2) / 3.0)
        })
      }
    })

    this.customerData.isInTrasition = false
  },
  reloadDatas: function() {
    this.setData({
      loadingDataError: false
    })
    
    this.showLoadingView()
    this.customerData.isInLoading = true

    //0：关键字搜索，1：类别搜索
    if(this.customerData.loadingAdsMode == 0) {
      this.loadMoreAdDatasWithRefreshMode(true)
    } else {
      this.loadMoreCategoryAdsWithRefreshMode(true)
    }
  },
  onPullDownRefresh: function() {
    this.loadMoreAdDatasWithRefreshMode(true)
  },
  onReachBottom: function(e) {
    if(this.customerData.isInLoading) {
      return
    }
    this.customerData.isInLoading = true

    //0：关键字搜索，1：类别搜索
    if(this.customerData.loadingAdsMode == 0) {
      this.loadMoreAdDatasWithRefreshMode(false)
    } else {
      this.loadMoreCategoryAdsWithRefreshMode(false)
    }
  },
  //类别搜索
  loadMoreCategoryAdsWithRefreshMode: function(isRefresh) {
    if(isRefresh) {
      this.resetLoadAdDataPrams()
    }

    let that = this
    let params = this.loadCategoryAdDatasParams()
    let success = function(items) {
      that.loadMoreAdDatasSuccess(isRefresh, items)
    }
    let fail = function() {
      that.loadMoreAdDatasFail(isRefresh)
    }
    let complete = function() {
      setTimeout(function() {
        that.customerData.isInLoading = false
        wx.hideToast()
      }, 2000)
    }
    addatamanager.getAdsByTag(params, success, fail, complete)
  },
  //关键字搜索
  loadMoreAdDatasWithRefreshMode: function(isRefresh) {
    if(isRefresh) {
      this.resetLoadAdDataPrams()
    }

    let that = this
    let params = this.loadAdDatasParams()
    let success = function(items) {
      that.loadMoreAdDatasSuccess(isRefresh, items)
    }
    let fail = function() {
      that.loadMoreAdDatasFail(isRefresh)
    }
    let complete = function() {
      setTimeout(function() {
        that.customerData.isInLoading = false
      }, 2000)
    }
    addatamanager.searchAdWithParmas(params, success, fail, complete)
  },
  resetLoadAdDataPrams: function() {
    this.customerData.loadingIdx = 0
  },
  loadCategoryAdDatasParams: function() {
    var opts = {
      "from" : kPageSize * this.customerData.loadingIdx,
      "size" : kPageSize,
      "banner": false
    };
    return {
      opts: JSON.stringify(opts),
      tags: this.customerData.categoryName
    };
  },
  loadAdDatasParams: function() {
    var opts = {
      "from" : kPageSize * this.customerData.loadingIdx,
      "size" : kPageSize,
      "banner": false
    };
    return {
      opts: JSON.stringify(opts),
      searchText: this.customerData.searchText
    };
  },
  loadMoreAdDatasSuccess: function(isRefresh, retItems) {
    this.customerData.isFirstLoading = false
    this.customerData.loadingIdx += 1

    let items = this.data.items
    items = items.concat(retItems)
    this.setData({ 
      items: items,
      hasMore: (retItems.length >= kPageSize),
      showNoDatas: (!items || items.length ==0 )
    })
  },
  loadMoreAdDatasFail: function(isRefresh) {
    wx.showToast({
      title: "加载数据失败",
      duration: 2000
    })

    if (isRefresh && this.customerData.isFirstLoading) {
      this.setData({
        loadingDataError: true
      })
    }
  },
  showLoadingView: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
  },
  clickOnAdView: function(e) {
    if (this.customerData.isInTrasition) {
      return
    }

    //点击adView
    var idx = e.currentTarget.dataset.index - 0
    var adInfo = this.data.items.length > idx && this.data.items[idx]
    if (adInfo) {
      this.customerData.isInTrasition = true
      this.gotoAdDetailView(adInfo.content)
    }
  },
  gotoAdDetailView: function(adInfo) {
    app.globalData.adInfo = adInfo
    let url = routerfactory.adDetailRouterUrl(adInfo.id)
    router.openUrl(url)
  },
  clearKeyword: function() {
    this.setData({
      inputValue: "",
      focus: true
    })
  },
  clickSearchAds: function(e) {
    wx.hideKeyboard()
    
    if (this.customerData.searchText && this.customerData.searchText.length > 0) {
      this.saveSearchKeywords() 
      this.reloadDatas()
    }
  },
  saveSearchKeywords: function() {
    let searchkeywords = this.data.searchkeywords
    for (let i = 0; i < searchkeywords.length; i++) {
      let keyword = searchkeywords[i]
      if (keyword == this.customerData.searchText) {
        searchkeywords.splice(i, 1)
        break;
      }
    }
    searchkeywords.unshift(this.customerData.searchText)
    this.setData({
      searchkeywords: searchkeywords
    })
    wx.setStorage({
      key: 'searchkeywords',
      data: searchkeywords,
    })
  },
  beginEditText: function(e) {
    this.setData({
      cancelColor: "#10B7F5"
    })
    this.setData({
      items: [],
      showSearchView: true
    })
  },
  endEditText: function(e) {
    this.setData({
      cancelColor: "#969696"
    })
    
    let canShow = !(this.customerData.searchText && this.customerData.searchText.length > 0) || 
                  !(this.customerData.tag && this.customerData.tag.length > 0)
    this.setData({
      showSearchView: canShow
    })
  },
  searchAds: function(e) {
    this.clickSearchAds()
  },
  inputSearchKeyword: function(e) {
    this.customerData.searchText = e.detail.value
    this.customerData.searchText = this.customerData.searchText.replace(" ", "")
    this.setData({
      inputValue: this.customerData.searchText
    })
  },
  clickOnCategoryButton: function(e) {
    let idx = e.currentTarget.dataset.index
    let categories = this.data.categories
    if (idx > categories.length) {
      return
    }
    //类别搜索模式
    this.customerData.loadingAdsMode = 1
    this.customerData.categoryName = categories[idx] 
    this.reloadDatas()
    this.setData({
      showSearchView: false,
      inputValue: "",
      focus: false
    })
  },
  clickOnKeywordCell: function(e) {
    let idx = e.currentTarget.dataset.index
    let searchkeywords = this.data.searchkeywords
    if (idx > searchkeywords.length) {
      return
    }
    //关键字搜索模式
    this.customerData.loadingAdsMode = 0
    this.customerData.searchText = searchkeywords[idx]
    this.reloadDatas()
    this.setData({
      showSearchView: false,
      inputValue: this.customerData.searchText,
      focus: false
    })
  },
  clearSearchKeyword: function(e) {
    this.setData({
      searchkeywords: []
    })
    wx.clearStorage({
      key: 'searchkeywords'
    })
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: config.shareTitle, // 分享标题
      desc: config.shareDesc, // 分享描述
      path: '/pages/adsearch/adsearch' // 分享路径
    }
  }
})