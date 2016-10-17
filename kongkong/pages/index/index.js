Page({
  data: {
    loadingviewhidden: false,
    selectedctgindex: 0,
    scrolltop: 0,
    categories: [
      "最新",
      "同城",
      "关注",
      "鞋包",
      "数码",
      "图书",
      "服饰",
      "个护",
      "家居",
      "母婴"
    ],
    items: [
      {
        type: "bannerview",
        items: [
          {
            url: "http://file.baixing.net/201610/yonghuqun.png"
          },
          {
            url: "http://file.baixing.net/201609/xiaokongdegushi09292.png"
          },
          {
            url: "http://file.baixing.net/201609/zuijiahuatidang1.png"
          },
          {
            url: "http://file.baixing.net/201609/difangqun0906.png"
          },
          {
            url: "http://file.baixing.net/201608/qqgroup2.png"
          }
        ]
      },
      {
        type: "lastestview",
        items: [
          {
            image: "http://file.baixing.net/201608/qqgroup2.png",
            name: "某某某1",
            avatar: "http://file.baixing.net/201609/difangqun0906.png",
            content: "休闲裤子免费送，有需要的来申请",
            extro: "送出物品"
          }
          // ,
          // {
          //   image: "http://file.baixing.net/201608/qqgroup2.png",
          //   name: "某某某2",
          //   avatar: "http://file.baixing.net/201609/difangqun0906.png",
          //   content: "休闲裤子免费送，有需要的来申请",
          //   extro: "送出物品"
          // }
        ]
      },
      {
        type: "adview",
        items: [
          {
            avatar: "http://file.baixing.net/201609/difangqun0906.png",
            region: "广州 | 白云",
            name: "某某某3",
            time: "一小时前",
            content: "洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申",
            applicanter: 10,
            commenter: 15,
            liker:20,
            images: [
              "http://file.baixing.net/201610/yonghuqun.png",
              "http://file.baixing.net/201609/xiaokongdegushi09292.png",
              "http://file.baixing.net/201609/difangqun0906.png",
              "http://file.baixing.net/201609/zuijiahuatidang1.png",
              "http://file.baixing.net/201608/qqgroup2.png"
            ]
          }
        ]
      },
      {
        type: "adview",
        items: [
          {
            avatar: "http://file.baixing.net/201609/difangqun0906.png",
            region: "广州 | 白云",
            name: "某某某3",
            time: "一小时前",
            content: "洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申",
            applicanter: 10,
            commenter: 15,
            liker:20,
            images: [
              "http://file.baixing.net/201610/yonghuqun.png",
              "http://file.baixing.net/201609/xiaokongdegushi09292.png",
              "http://file.baixing.net/201609/difangqun0906.png",
              "http://file.baixing.net/201609/zuijiahuatidang1.png",
              "http://file.baixing.net/201608/qqgroup2.png"
            ]
          }
        ]
      },
      {
        type: "adview",
        items: [
          {
            avatar: "http://file.baixing.net/201609/difangqun0906.png",
            region: "广州 | 白云",
            name: "某某某3",
            time: "一小时前",
            content: "洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申，洗发水马油，全新韩国马油，喜欢的申",
            applicanter: 10,
            commenter: 15,
            liker:20,
            images: [
              "http://file.baixing.net/201610/yonghuqun.png",
              "http://file.baixing.net/201609/xiaokongdegushi09292.png",
              "http://file.baixing.net/201609/difangqun0906.png",
              "http://file.baixing.net/201609/zuijiahuatidang1.png",
              "http://file.baixing.net/201608/qqgroup2.png"
            ]
          }
        ]
      }
    ]
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
    this.showloadingview()
    // this.begineanimatelastestview()
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
  taponcategorybutton: function(sender) {
    var selectedCtgIdx = this.data.selectedctgindex
    if (sender.target.id == selectedCtgIdx) {
      return
    }
    
    this.showloadingview()
    this.setData({
      selectedctgindex: parseInt(sender.target.id)
    })
  },
  taponbannerimage: function(sender) {
    console.log('click on banner view' + sender.target.id);
  },
  showloadingview: function() {
    this.setData({
        loadingviewhidden: false
    })
    var that = this
    setTimeout(function () {
      that.setData({
        loadingviewhidden: true
      })
    }, 1000)
  },
  begineanimatelastestview: function() {
    var lastestinfonum
    var items = this.data.items;
    for (var i=0;i<items.length;i++) {
      var item = items[i]
      console.log(item.type)
      if (item.type == 'lastestview') {
        lastestinfonum = item.items.length
        break
      }
    }
 
    if (lastestinfonum == 0 || lastestinfonum == 1) {
      return
    }

    this.animatelastestview(1, lastestinfonum, i)
  },
  animatelastestview: function(idx, num, flag) {
    if (idx == num) {
        idx = 0
    }

    this.setData({
      scrolltop:(idx * 60) 
    });
    idx++

    console.log();

    var that = this;
    setTimeout(function() {
      that.animatelastestview(idx, num);
    }, 2000)
  },
})