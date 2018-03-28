// pages/input/input.js

var CusBase64 = require('../../utils/base64.js');
var util = require('../../utils/md5.js')    

let app = getApp();

const recorderOptions = {
  duration: 10000,//指定录音的时长，单位 ms
  sampleRate: 16000,//采样率
  numberOfChannels: 1,//录音通道数
  encodeBitRate: 96000,//编码码率
  format: 'mp3',//音频格式，有效值 aac/mp3
  frameSize: 50,//指定帧大小，单位 KB
}
const recorderManager = wx.getRecorderManager()
var tempFilePath;

Page({
  data: {
    currentTime: null,
    high_pressure: null,
    low_pressure: null,
    heart_rate: null,
  },

  /**
   * 格式化获取当前时间
   */
  getCurrentTime: function () {
    var time = "";
    var myDate = new Date();
    var year = myDate.getFullYear();
    time = year;
    var month = myDate.getMonth() + 1;//获取当前月份(0-11,0代表1月)
    if (month < 10) {
      time = time + "/0" + month;
    } else {
      time = time + "/" + month;
    }
    var day = myDate.getDate();
    if (day < 10) {
      time = time + "/0" + day;
    } else {
      time = time + "/" + day;
    }

    var hours = myDate.getHours();//获取当前小时数(0-23)
    if (hours < 12) {
      time = time + " 上午 " + hours;
    } else {
      time = time + " 下午 " + (hours - 12);
    }
    var minutes = myDate.getMinutes();//获取当前分钟数(0-59)
    if (minutes < 10) {
      time = time + ":0" + minutes;
    } else {
      time = time + ":" + minutes;
    }

    this.setData({
      currentTime: time
    })
  },

  /**
  * 提交保存
  */
  onClickSubmit: function (e) {
    var result = e.detail.value;
    var high_pressure = result.high_pressure;
    if (high_pressure.length == 0) {
      app.showToast('请输入高压/收缩压');
      return;
    }
    if (high_pressure < 100 || high_pressure > 300) {
      app.showToast('高压/收缩压输入不正确');
      return;
    }
    var low_pressure = result.low_pressure;
    if (low_pressure.length == 0) {
      app.showToast('请输入低压/舒张压');
      return;
    }
    if (low_pressure < 50 || low_pressure > 150) {
      app.showToast('低压/舒张压输入不正确');
      return;
    }
    var heart_rate = result.heart_rate;
    if (heart_rate.length == 0) { 
      app.showToast('请输入脉搏/心率');
      return;
    }
    var requestBody = new Object();
    // requestBody.action = "WxinUploadBloodPressure";
    requestBody.weixin_id = app.globalData.userInfo.openId;;
    requestBody.watch_Id = "123456";

    var bloodPressure = new Object();
    var timestamp = (new Date().getTime() / 1000).toFixed(0);
    bloodPressure.calcTime = timestamp;
    bloodPressure.sys = high_pressure;
    bloodPressure.dia = low_pressure;
    bloodPressure.pulse = heart_rate;

    var bloodPressureArray = new Array();
    bloodPressureArray.push(bloodPressure);

    requestBody.bloodpressure = bloodPressureArray;

    var requestData = JSON.stringify(requestBody);
    console.log(requestData);
    var self = this;
    app.postRequest({
      url: '?action=WxinUploadBloodPressure',
      data: requestData,
      success: function (res) {
        console.log(res.data);
        wx.navigateBack({
          delta: 1,
        })
      },
      fail: function (error) {
        app.showToast(error.message)
      }
    })
  },

  registerRecorderListener: function () {
    var self = this;

    recorderManager.onStart(() => {
      console.log('recorder start')
      // wx.showLoading({
      //   title: '正在录音...',
      //   mask: true
      // })
    })

    recorderManager.onStop((res) => {
      // wx.hideLoading();
      // this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
      const { tempFilePath } = res
      self.olamiTranslateAudio(res.tempFilePath)
    })

    recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      // if (res.isLastFrame) {
      //   // var result = CusBase64.CusBASE64.encoder(frameBuffer);
      //   var base64 = wx.arrayBufferToBase64(frameBuffer)
      //   // console.log(base64)
      //   self.xufeiTranslateAudio(base64)
      // }

      // console.log('frameBuffer', frameBuffer)
      // console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })

    recorderManager.onError((res) => {
      console.log(res);
      // wx.hideLoading();
      app.showToast('启动录音失败');
    })
  },

  // ArrayBuffer转为字符串，参数为ArrayBuffer对象
  ab2str: function(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  },

  // 字符串转为ArrayBuffer对象，参数为字符串
  str2ab: function(str) {
    var buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  },

  xufeiTranslateAudio: function (audioBase64) {
    wx.showLoading({
      title: '解析中...',
      mask: true
    })
    var ApiKey = '5a4493e3';

    var timestamp = (new Date().getTime() / 1000).toFixed(0);

    var x_param_obj = {};
    x_param_obj.auf = '8k';
    x_param_obj.aue = 'raw';
    x_param_obj.scene = 'main';
    // var X_Param = wx.arrayBufferToBase64(this.str2ab(JSON.stringify(x_param_obj)));
    var X_Param = CusBase64.CusBASE64.encoder(JSON.stringify(x_param_obj));
    var X_CheckSum_String = ApiKey + timestamp + X_Param + 'data='+audioBase64;
    console.log(X_CheckSum_String);
    var X_CheckSum = util.hexMD5(X_CheckSum_String);
    console.log(X_CheckSum);

    wx.request({
      url: 'https://api.xfyun.cn/v1/aiui/v1/iat',
      header: {
        'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-Appid': ApiKey,
        'X-CurTime': timestamp,
        'X-Param': X_Param,
        'X-CheckSum': X_CheckSum
      },
      method: 'POST',
      data: {
        'data': audioBase64
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res);
      },
      fail: function (error) {
        wx.hideLoading();
        console.log(error);
      }
    })
  },

  olamiTranslateAudio: function (audioPath) {
    var self = this;
    wx.showLoading({
      title: '解析中...',
      mask: true
    })
    wx.uploadFile({
      url: 'https://www.veim.cn/applet.php?action=speechRec',
      filePath: audioPath,
      name: 'speech',
      success: function (res) {
        wx.hideLoading();
        var result = JSON.parse(res.data)
        console.log(result)
        self.setData({
          high_pressure: result.sys,
          low_pressure: result.dia,
          heart_rate: result.hb,
        })
      },
      fail: function (error) {
        wx.hideLoading();
      }
    })
  },

  touchdown: function (e) {
    recorderManager.start(recorderOptions);
  },

  touchup: function (e) {
    recorderManager.stop();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCurrentTime();
    this.registerRecorderListener();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

})