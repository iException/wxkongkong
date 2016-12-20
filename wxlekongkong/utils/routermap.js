 function viewMap(aliseName) {
     return {
         "addetail": {
             "realName": "addetail", //真正的跳转名称
             "intro": "登录页面"//当前页面简洁，便于 
         }[aliseName]
     }
 }
 
 function aliseName2RealName(aliseName) {
     let info = viewMap(aliseName)
     return info && info["realName"] ? info["realName"] : aliseName
 }

 function realName2AliseName(realName) {

 }

 module.exports = {
     aliseName2RealName: aliseName2RealName,
     realName2AliseName: realName2AliseName
 }