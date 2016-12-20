let routerMap = require("routermap.js")

function openUrl(url) {
    if (!url) {
        return
    } 

    //小程序跳转  celebriyad?adId=xxx, 没有后面的/
    url = url.replace("lkk://", "")
    url = url.replace("/")
    let urls = url.split("?")
    if (!urls && (urls.length == 0)) {
        return
    }

    let realName =  routerMap.aliseName2RealName(urls[0])
    let params = (urls.length == 2) ? urls[1] : ""
    let toUrl = "../" + realName + "/" + realName + "?" + params
    wx.navigateTo({
      url: toUrl,
    })
}

module.exports = {
    openUrl: openUrl
}