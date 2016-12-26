var config = require("../config.js");
var apiManager = require("../utils/apimanager.js");

function getCelebrityItem({params, success, fail, complete}) {
    let url = config.getCelebrityItemUrl()
    apiManager.request({url: url, data: params, method: "GET", success: function(res) {
        if (typeof success == 'function') {
            let item = handleCelebrityItem(res)
            success(item)
        }
    }, fail: fail, complete: complete})
}

function handleCelebrityItem(item) {
    let content = item.data.result.display.content
    let user = {
        name: content.name,
        avatar: content.avatar,
        identity: content.identity
    }
    let posted = content.status == 2   //0：正在进行，1：尚未开始，2：已赠送.
    let winner, reason
    if (posted) {
        let thanksLetter = content.chosenApplication.thanksLetter
        winner = {
            name: content.chosenApplication.applicant.nick,
            avatar: content.chosenApplication.applicant.avatar,
            reason: content.chosenApplication.reason,
            thanks: thanksLetter ? thanksLetter["text"] : "",
            thanksImage: thanksLetter ? thanksLetter["image"] : ""
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