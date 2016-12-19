var config = require("../config.js")
var util = require("../utils/util.js")
var apiManager = require("../utils/apimanager.js")

function loadMoreAdApplicants(params, success, fail, complete) {
    let url = config.getAdApplicantsListUrl()
    apiManager.request({url: url, data: params, method: "GET", success: function(res) {
        if (success) {
            let item = handleAdApplicants(res)
            success(item)
        }
    }, fail: fail, complete: complete})
}

function handleAdApplicants(ret) {
    let hotApplicants = resetAdApplicants(ret.data.result.items.top)
    let norApplicants = resetAdApplicants(ret.data.result.items.new)
    let apiInfo = {
        endFlag: ret.data.result.endFlag,
        lastId: ret.data.result.lastId
    }

    return {
        apiInfo: apiInfo,
        hotApplicants: hotApplicants,
        normalApplicants: norApplicants
    }
}

function resetAdApplicants(applicants) {
    let newApplicants
    if (applicants && applicants.length) {
        newApplicants = []
        for (let i = 0; i < applicants.length; i++) {
            newApplicants.push(filterAdApplicantInfo(applicants[i]))
        }
    }
    return newApplicants
}

function filterAdApplicantInfo(item) {
    var date = new Date(item.createdAt * 1000)
    date: util.adFormatTime(date)
    return {
        name: item.applicant.nick,
        data: date,
        avatar: item.applicant.avatar,
        reason: item.reason
    }
}

module.exports = {
    loadMoreAdApplicants: loadMoreAdApplicants
}