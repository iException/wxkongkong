let config = require("../config.js");
let util = require("../utils/util.js");
let apimanager = require("../utils/apimanager.js");

function loadMoreTopicsWithParams(params, success, fail, complete) {
    let url = config.getTopicListUrl()
    apimanager.request({
        url: url, 
        data: params,
        method: 'GET',
        success: function(ret) {
          if (typeof success == 'function') {
              let info = handleTopicItems(ret)
              success(info)
          }
        },
        fail: fail,
        complete: complete
    })
}

function handleTopicItems(ret) {
    let result = ret.data.result
    let items = []
    for (let i = 0; i < result.items.length; i++) {
        let item = result.items[i].display.content
        var date = new Date(item.createdAt * 1000)
        let nItem = {
            user: {
                avatarUrl: item.user.avatar.square,
                nick: item.user.nick
            },
            description: item.content,
            commentNum: item.commentNum,
            date: util.adFormatTime(date),
            likeCount: item.likeCount,
            likedUsers: item.likedUsers,
            images: item.images,
            city: item.region.names.join("|"),
            id: item.id
        }
        items.push(nItem)
    }

    return {
        apiInfo: {
            "id": result.lastId,
            "endFlag": result.endFlag
        },
        items: items
    }
}

function getTopicDetailWithParams(params, success, fail, complete) {

}

module.exports = {
    loadMoreTopicsWithParams: loadMoreTopicsWithParams,
    getTopicDetailWithParams: getTopicDetailWithParams
}