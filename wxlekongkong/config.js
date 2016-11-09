module.exports = {
    host: "https://api2.lekongkong.com",
    getAdListUrl: function() {
        return this.host + "/api/Listing.listingByRegion";
    },
    getAdDetailUrl: function() {
        return this.host + "";
    },
    getApplicantorListUrl: function() {
        return this.host + "/api/ListingNew.getGiftApplicationsReader";
    },
    defaultHeader: {
        "Lkk-Dev-Name": "madong",
        "BAPI-APP-KEY": "api_ioslekongkong",
        "BAPI-USER-TOKEN": "330",
        "UDID": "123123123123123123",
        "APP_VERSION": "1.1.2",
        "BAPI-HASH": "wozhishixiang@@shishi..zhengde_!!"
    },
    appVersion: "1.6.6"
}