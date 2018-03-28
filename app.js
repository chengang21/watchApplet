//app.js
let network = require('./utils/network.js');
//https://www.cnblogs.com/leoxuan/p/7828470.html
App({
  onLaunch: function (options) {
    //调用API从本地缓存中获取数据
    this.getWindowInfo()
    var userInfo = wx.getStorageSync('openInfo');
    // wx.setStorageSync('watch_Id', '123456');
    var watch_Id = wx.getStorageSync('watch_Id');
    var name = wx.getStorageSync('name');
    this.globalData.userInfo = userInfo;
    this.globalData.watch_Id = watch_Id;
    this.globalData.name = name; 

    // console.log("App onLaunch Path: " + options.path)
    // console.log("App onLaunch Params: " + JSON.stringify(options.query))
    // console.log("App onLaunch scene: " + options.scene)
  },
  onShow: function (options){
    // console.log("App onShow Path: " + options.path)
    // console.log("App onShow Params: " + JSON.stringify(options.query))
    // console.log("App onShow scene: " + options.scene)
  },
  getWindowInfo: function () {
    var self = this
    wx.getSystemInfo({
      success: function (res) {
        self.globalData.windowWidth = res.windowWidth
        self.globalData.windowHeight = res.windowHeight
      }
    })
  },
  getRequest: function (data) {
    network.getRequest(data)
  },
  postRequest: function (data) {
    network.postRequest(data)
  },
  updateRequest: function (data) {
    network.updateRequest(data)
  },
  deleteRequest: function (data) {
    network.deleteRequest(data)
  },
  showToast: function(message){
    wx.showToast({
      title: message,
      icon: 'none'
    })
  },
  globalData: {
    windowWidth: 0,
    windowHeight: 0,
    baseUrl: network.baseUrl,
    userInfo: null, 
    watch_Id: '',
    name: null
  }
})
