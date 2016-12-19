var config = require("../config.js")
var apiManager = require("../utils/apimanager.js")

function getCelebrityItem({params, success, fail, complete}) {
    let url = config.getCelebrityItemUrl()
    apiManager.request({url: url, data: params, method: "GET", success: function(res) {
        if (success) {
            let item = handleCelebrityItem(res)
            success(item)
        }
    }, fail: fail, complete: complete})
}

function handleCelebrityItem(item) {
    let content = item.result.display.content
    let user = {
        name: content.name,
        avatar: content.avatar,
        identity: content.identity
    }
    let posted = content.status == 2
    let winner, reason
    if (posted) {
        winner = {
            name: content.chosenApplication.applicant.nick,
            avatar: content.chosenApplication.avatar,
            thanks: "",
            thanksImage: ""
        }
        reason = {
            reasonTitle: content.reasonTitle,
            reason: content.reason
        }
    }
    let rule = {
        ruleTitle: content.ruleTitle,
        rule: content.rule
    } 
    let adInfo = {
        applicationCount: content.applicationCount,
        content: content.content,
        video: content.videoUrl,
        images: content.images,
        posted: posted,
        winner: winner,
        reason: reason,
        rule: rule,
        user: user
    }
    
    return adInfo
}

module.exports = {
    getCelebrityItem : getCelebrityItem
}