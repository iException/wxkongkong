var config = require("../config.js")
var util = require("../utils/util.js")
var apimanager = require("../utils/apimanager.js")

function getPageLayout(params, success, fail, complete) {
    var url = config.getHomePageLayoutUrl()
    apimanager.request({
        url: url, 
        data: params,
        method: 'GET',
        success: function(ret) {
          if(typeof success == 'function') {
            let datas = loadPagelayoutSuccess(ret)
            success(datas)
          }
        },
        fail: fail,
        complete: complete
    })
}

function loadPagelayoutSuccess(ret) {
  var results = ret['data']['result']
  var lastestItems
  var celebrityItem
  for(let i = 0; i < results.length; i++) {
    let item = results[i]
    if (item['display']['style'] == 'HomeLatestSection') {
      lastestItems = item["children"]
    } else if (item['display']['style'] == 'DiscoverySectionScrollable') {
      var items = []
      if (item && item.children.length) {
        for (let i = 0; i < item.children.length; i++) {
          let celebrity = item.children[i]
          if (celebrity.display.content.status==2) {
            celebrity.display.content.statusString = "活动进行中"
            celebrity.display.content.color = "#10B7F5"
          } else if (celebrity.display.content.status == 1) {
            celebrity.display.content.statusString = "尚未开始"
            celebrity.display.content.color = "#969696"
          } else {
            celebrity.display.content.statusString = "活动已结束"
            celebrity.display.content.color = "#969696"
          }
          celebrity.display.content.action = celebrity.action
          items.push(celebrity.display.content)
        }
      }
      celebrityItem = {items: items, 'title': item.display.content.title, 'showViewAll': item.display.content.showViewAll}
    }
  }

  let topicItems = getTopicItems()
  let categoryItems = getCategoryItems()
  let activityItems = getActivityItems()
  
  return {
    activityItems: activityItems,
    categoryItems: categoryItems ? categoryItems : [],
    lastestItems: lastestItems ? lastestItems: [],
    topicItems: topicItems ? topicItems : [],
    celebrityItem: celebrityItem ? celebrityItem : []
  }
}

function getActivityItems() {
    return '../../resource/images/banner_intro.jpg'
}

function getCategoryItems() {
    return [
        {
        title: "服装服饰",
        bannerimage: "../../resource/images/icon_fushi.png"
        },
        {
        title: "鞋帽箱包",
        bannerimage: "../../resource/images/icon_xiebao.png"
        },
        {
        title: "配件配饰",
        bannerimage: "../../resource/images/icon_peishi.png"
        },
        {
        title: "家居用品",
        bannerimage: "../../resource/images/icon_jiaju.png"
        },
        {
        title: "数码产品",
        bannerimage: "../../resource/images/icon_shuma.png"
        },
        {
        title: "图书音像",
        bannerimage: "../../resource/images/icon_tushu.png"
        },
        {
        title: "母婴用品",
        bannerimage: "../../resource/images/icon_muying.png"
        },
        {
        title: "个护美妆",
        bannerimage: "../../resource/images/icon_gehu.png"
        }
    ]
}

function getTopicItems() { 
    return "../../resource/images/banner_shaidan.jpg"
}

module.exports = {
    getPageLayout: getPageLayout
}