// pages/home/home.js
var wxCharts = require('../../components/wx-charts/wxcharts.js');
let app = getApp();
var lineChart = null;

Page({
  data: {
    stepCount: 0,
    heartCount: 0,
    bpressures: [],
    month_bpressure_sys: 0,
    month_bpressure_dia: 0,
    month_bpressure_sys_label: '',
    month_bpressure_dia_label: '',
    userInfo: null,
    hasUserInfo: false,
    blood_average_value: "0/0",
    healthy_tip: "血压正常，请保持生活习惯",
  },

  onLoad: function (options) {
    // console.log(options)
    if(options.name){
      app.globalData.name = options.name;
      app.globalData.watch_Id = options.watchId;
    }
  },

  onShow: function() {
    // console.log("Home onShow Path: " + options.path)
    // console.log("Home onShow Params: " + JSON.stringify(options.query))
    // console.log("Home onShow scene: " + options.scene)
    // options.socialUid
    if (!app.globalData.userInfo) {
      this.getOpenInfo();
    } else {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.loadData();
    }
  },

  touchHandler: function (e) {
    // console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },

  createSimulationData: function () {
    var categories = [];
    var data1 = [];
    var data2 = [];
    var data3 = [];
    var data4 = [];
    var average_sys = 0;
    var average_dia = 0;
    var len = this.data.bpressures.length;
    for (var i = 0; i < len; i++) {
      var bloodpressure = this.data.bpressures[i];
      categories.push(this.formatDate(bloodpressure.calcTime));
      var sys = parseInt(bloodpressure.sys);
      var dia = parseInt(bloodpressure.dia);
      data1.push(sys);
      data2.push(this.data.month_bpressure_sys);
      data3.push(dia);
      data4.push(this.data.month_bpressure_dia);
      average_sys = average_sys + sys;
      average_dia = average_dia + dia;
    }
    var tip = "";
    if (average_sys > 0) {
      var high_bloodpressure = parseInt(average_sys / len);
      var low_bloodpressure = parseInt(average_dia / len);
      if (high_bloodpressure < 140 && low_bloodpressure <= 90) {
        tip = "血压正常,请保持生活习惯";
      } else {
        tip = "血压偏高,请保持生活习惯并按医嘱服药";
      }
      this.setData({
        blood_average_value: high_bloodpressure + "/" + low_bloodpressure
      })
    }
    

    return {
      categories: categories,
      data1: data1,
      data2: data2,
      data3: data3,
      data4: data4
    }
  },

  formatDate: function (timestamp) {
    var newDate = new Date();
    newDate.setTime(timestamp * 1000);
    var year = newDate.getYear();
    var month = newDate.getMonth() + 1;
    var date = newDate.getDate();
    var hour = newDate.getHours();
    var minute = newDate.getMinutes();
    var second = newDate.getSeconds();
    // console.log(year + "-" + month + "-" + date + "   " + hour + ":" + minute + ":" + second)
    return month + "-" + date;
  },

  /**
   * 初始化Chart
   */
  initCharts: function () {
    var qian_str = -1;
    var hou_str = -1
    var simulationData = this.createSimulationData();
    if (simulationData.categories.length < 1)
      return;
    var qian_str = -1;
    var hou_str = -1;
    var self = this;
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      animation: true,
      // categories: [100, 100, 100],
      categories: simulationData.categories,
      // fontSize: 30,
      // background: '#f5f5f5',
      series: [{
        name: '收缩压',
        // data: [100, 100, 100],
        data: simulationData.data1,
        // format: function (val, name) {
        //   return val.toFixed(2) + '万';
        // }
        color: '#7cb5ec',
      }, {
        name: '前30天平均收缩压',
        // data: [100, 100, 100],
        data: simulationData.data2,
        color: '#7cb5ec',
        format: function (val, name) {
          if (qian_str == -1) {
            qian_str = 1
            return "           " + self.data.month_bpressure_sys_label + ":" + val
          }
          return ""
        }
      }, {
        name: '舒张压',
        // data: [100, 100, 100],
        data: simulationData.data3,
        color: '#f7a35c',
      },
      {
        name: '前30天平均舒张压',
        // data: [100, 100, 100],
        data: simulationData.data4,
        color: '#f7a35c',
        fontColor: '#f7a35c',
        format: function (val, name) {
          if (hou_str == -1) {
            hou_str = 1
            return "           " + self.data.month_bpressure_dia_label + ":" + val
          }
          return ""
        }
      }],
      xAxis: {
        disableGrid: false,
        // fontColor: '#8085e9',
        // gridColor: '#8085e9',
        // titleFontColor: '#f7a35c'
      },
      yAxis: {
        // title: '成交金额 (万元)',
        // format: function (val) {
        //   return val.toFixed(2);
        // },
        // min: 0
        // fontColor: '#8085e9',
        // gridColor: '#8085e9',
        // titleFontColor: '#f7a35c'
      },
      width: app.globalData.windowWidth,
      height: 220,
      dataLabel: true,
      dataPointShape: false,
      legend: false,
      extra: {
        lineStyle: 'curve'
      }
    });
  },

  loadData: function () {
    var self = this;
    var weixin_id = self.data.userInfo.openId;
    var watchId = app.globalData.watch_Id;
    var name = app.globalData.name;
    var url = '?action=getData&weixin_id=' + weixin_id + '&watchId=' + watchId + '&name=' + name;
    app.getRequest({
      url: url,
      success: function (res) {
        console.log(res);
        var result = res.data;
        self.setData({
          stepCount: result.stepCount,
          heartCount: result.heartRateCount,
          month_bpressure_sys: parseInt(result.month_bpressure_sys),
          month_bpressure_dia: parseInt(result.month_bpressure_dia),
          bpressures: result.bpressures,
          month_bpressure_sys_label: result.month_bpressure_sys_label,
          month_bpressure_dia_label: result.month_bpressure_dia_label,
        });
        self.initCharts();
      },
      fail: function (error) {
        app.showToast(error.message)
      }
    })
  },

  getOpenInfo: function () {
    var self = this;
    wx.getUserInfo({
      success: res => {
        console.log(res);
        self.wxLogin(res.userInfo);
      }
    })
  },

  wxLogin: function (userInfo) {
    var self = this;
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.login({
      success: res => {
        var url = '?action=WxinGetOpenId&Weixin_code=' + res.code;
        app.getRequest({
          url: url,
          showLoading: false,
          success: function (res) {
            console.log(res);
            var result = res.data;
            userInfo.openId = res.data.openid;//获取到的openid  
            // userInfo.session_key = res.data.session_key;//获取到session_key
            // userInfo.expires_in = Date.now() + res.data.expires_in
            self.loginDKSevice(userInfo);
          },
          fail: function (error) {
            wx.hideLoading()
            self.wetoast.showMessage(error.message)
          }
        })
      },
      fail: error => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 登录DK服务器
   */
  loginDKSevice: function (userInfo) {
    var self = this;
    var url = '?action=WxinLogin&weixin_id=' + userInfo.openId + '&name=' + app.globalData.name + '&watchId=' + app.globalData.watch_Id;
    console.log(url);

    app.getRequest({
      url: url,
      showLoading: false,
      success: function (res) {
        wx.hideLoading()
        console.log(res);
        wx.setStorageSync('openInfo', userInfo)
        app.globalData.userInfo = userInfo
        self.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })

        var result = res.data;
        var watch_Id = result.watch_Id;
        if (watch_Id) {
          app.globalData.watch_Id = watch_Id
          wx.setStorageSync('watch_Id', watch_Id)
        }
        var name = result.name;
        if (name) {
          app.globalData.name = name
          wx.setStorageSync('name', name)
        }

        self.loadData();
      },
      fail: function (error) {
        wx.hideLoading()
        self.wetoast.showMessage(error.message)
      }
    })
  },
});

// {"retcode":0, "retmsg":"success", 
//   "bpressures":[
//     { "calcTime": 1481264440, "sys": "70", "dia": "77", "heartRate": 100 }, 
//     { "calcTime": 1481264440, "sys": "70", "dia": "77", "heartRate": 100 }, 
//     { "calcTime": 1481264440, "sys": "70", "dia": "77", "heartRate": 100 }, 
//     { "calcTime": 1481264440, "sys": "70", "dia": "77", "heartRate": 100 }, 
//     { "calcTime": 1481264440, "sys": "70", "dia": "77", "heartRate": 100 }, 
//     { "calcTime": 1481264440, "sys": "70", "dia": "77", "heartRate": 100 },
//     { "calcTime": 1481264440, "sys": "70", "dia": "77", "heartRate": 100 }], 
//     "heartRateCount": 105, 
//     "stepCount": 10000, 
//     "month_bpressure_sys": 100, 
//     "month_bpressure_dia": 90
// }