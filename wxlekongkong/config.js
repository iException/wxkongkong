module.exports = {
    host: "https://api2.lekongkong.com",
    getHomePageLayoutUrl: function() {
        return this.host + "/api/PageLayout.homePage";
    },
    getAdListUrl: function() {
        return this.host + "/api/Listing.listingByRegion";
    },
    getAdDetailUrl: function() {
        return this.host + "/api/Gift.item";
    },
    getAdApplicantsListUrl: function() {
        return this.host + "/api/ListingNew.getGiftApplicationsReader";
    },
    getHingTagListUrl: function() {
        return this.host + "/api/Search.hintTags";
    },
    getSeachListingUrl: function() {
        return this.host + "/api/Listing.searchListing";
    },
    getTagListingUrl: function() {
        return this.host + "/api/Listing.tagListing";
    },
    getLastestAdListingUrl: function() {
        return this.host + "/api/News.getNewsList";
    },
    getCelebrityItemUrl: function() {
        return this.host + "/api/Celebrity.getItem"
    },
    getTopicListUrl: function() {
        return this.host + "/api/Topic.getTopicNew"
    },
    getTopicCommentListUrl: function() {
        return this.host + "/api/Comment.getTopicCommentNew"
    },
    getSearchAdListUrl: function() {
        // searchText
        return this.host + "/api/Listing.searchListing"
    },
    defaultHeader: {
        "Lkk-Dev-Name": "madong",
        "BAPI-APP-KEY": "api_ioslekongkong",
        "BAPI-USER-TOKEN": "330",
        "UDID": "123123123123123123",
        "APP_VERSION": "1.1.2",
        "BAPI-HASH": "wozhishixiang@@shishi..zhengde_!!"
    },
    appVersion: "1.6.6",
    shareTitle: "乐空空闲置赠送平台",
    shareDesc: "乐赠闲置，悦己利他",
    sharePath: "",
    downloadTitle:"温馨提示",
    downloadContent: '应用市场搜索并下载"乐空空"APP，即可加入这场断舍离运动！'
}