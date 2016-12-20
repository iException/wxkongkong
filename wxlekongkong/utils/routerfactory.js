function adDetailRouterUrl(adId) {
    return "lkk://addetail?" + (adId ? ("adId=" + adId) : "")
}

module.exports = {
    adDetailRouterUrl: adDetailRouterUrl
}