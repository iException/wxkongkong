const hInteval = 5
const vInteval = 5
const kPageSize = 30
const kEdgeInteval = 14
var app = getApp()

Page({
  data: {
    topic: null,
    windowHeight: 600,
    edgeInteval: kEdgeInteval
  },
  customerData: {
    topicId: "",
    windowWidth: 375
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    this.updateDeviceInfo()
    this.customerData.topicId = options["id"]
    let topicInfo = app.globalData.topicInfo
    if (topicInfo) {
        this.setData({
            topic: topicInfo
        })
    }
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
  }
})