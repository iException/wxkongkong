let utils = require("../../utils/util.js")
let datamanager = require("../../datamanager/addatamanager.js")

Page({
  customerData: {
    adId: "",
    name: "",
    mobile: "",
    address: ""
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    this.customerData.adId = options["adId"]
  },
  showErrorWithMsg: function(msg) {
    wx.showToast({
      title: msg,
      duration: 1000
    })
  },
  handleApplyAdRequest: function() {
    if (!utils.validPhone(this.customerData.mobile)) {
      this.showErrorWithMsg("请输入正确的手机号码!")
      return
    }

    if (this.customerData.name.length == 0) {
      this.showErrorWithMsg("请输入正确的姓名!")
      return
    }

    if (this.customerData.address.length == 0) {
      this.showErrorWithMsg("请输入正确的联系地址!")
      return
    }

    let params = this.applyAdParams()
    let success = function(e) {
      wx.hideToast()
      wx.showModal({
        title: "申请成功",
        content: e
      })
    }
    let that = this
    let fail = function() {
      that.showErrorWithMsg("申请失败")      
    }
    wx.showToast({
      title: '申请中...',
      icon: 'loading',
      duration: 10000
    })
    datamanager.applyAdWithParams(params, success, fail, null)
  },
  applyAdParams: function() {
    return {
      adId: this.customerData.adId,
      name: this.customerData.name,
      mobile: this.customerData.mobile,
      address: this.customerData.address
    }
  },
  onNameChanged: function(e) {
    this.customerData.name = e.detail.value
  },
  onMobileChanged: function(e) {
    this.customerData.mobile = e.detail.value
  },
  onAddressChanged: function(e) {
    this.customerData.address = e.detail.value
  }
})