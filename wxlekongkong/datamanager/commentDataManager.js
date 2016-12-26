var config = require("../config.js");
var util = require("../utils/util.js");
var apiManager = require("../utils/apimanager.js");

function getCommentListWithParams(params, success, fail, complete) {
    let url = config.getTopicCommentListUrl()
    apiManager.request({url: url, data: params, method: "GET", success: function(res) {
        if (typeof success == 'function') {
            let item = handleCommentList(res)
            success(item)
        }
    }, fail: fail, complete: complete})
}

function handleCommentList(retInfo) {
    let items = retInfo.data.result.items
    return {
        hotComments: resetCommentsInfo(items ? items.gift : []),
        norComments: resetCommentsInfo(items ? items.normal : []),
        apiInfo: {
            endFlag: retInfo.data.result.endFlag,
            lastId: retInfo.data.result.lastId
        }
    }
}

function resetCommentsInfo(comments) {
    if (!comments || comments.length == 0) {
        return []
    }

    let nComments = []
    for (let i = 0; i < comments.length; i++) {
        let comment = comments[i]
        let date = new Date(comment.modifiedAt * 1000)
        let content = comment.parent ? ("回复" + comment.parent.user.nick + ":" + comment.content) : comment.content 
        let nComment = {
            avatar: comment.user.avatar.square,
            name: comment.user.nick,
            comment: content,
            replay: comment.parent ? (comment.parent.user.nick + ":" + comment.parent.content) : "",
            date: util.adFormatTime(date)
        }
        nComments.push(nComment)
    }
    return nComments
}

module.exports = {
    getCommentListWithParams: getCommentListWithParams
}