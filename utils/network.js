//Newtwork request utils
let baseUrl = 'https://www.veim.cn/applet.php'

function getRequest(data) {
  data.method = 'GET'
  doRequest(data)
}

function postRequest(data) {
  data.method = 'POST'
  doRequest(data)
}

function updateRequest(data) {
  data.method = 'PUT'
  doRequest(data)
}

function deleteRequest(data) {
  data.method = 'DELETE'
  doRequest(data)
}

function doRequest(data) {
  var requestUrl = baseUrl + data.url
  if (data.pageIndex) {
    if (requestUrl.indexOf('?') == -1) {
      requestUrl = requestUrl + '?page=' + data.pageIndex + '&limit=' + (data.pageSize ? data.pageSize : '20')
    } else {
      requestUrl = requestUrl + '&page=' + data.pageIndex + '&limit=' + (data.pageSize ? data.pageSize : '20')
    }
  }
  var requestHeader = {
    'content-type': data.contentType ? data.contentType : 'application/json',
    'Authorization': wx.getStorageSync('accessToken')
  }
  var showLoading = data.showLoading != null ? data.showLoading : true
  if (showLoading) {
    wx.showLoading({
      title: '加载中....',
      mask: true
    })
  }
  wx.request({
    url: requestUrl,
    header: requestHeader,
    method: data.method ? data.method : 'GET',
    data: data.data ? data.data : {},
    success: function (res) {
      // console.log(res);
      if ((res.statusCode == 200 || res.statusCode == 204) && data && data.success) {
        if (res.data.page) {
          var currentPage = res.data.page.current_page
          var pageSize = res.data.page.per_page
          var totalCount = res.data.page.total_count
          var totalPages = 0
          if (totalCount % pageSize == 0) {
            totalPages = totalCount / pageSize
          } else {
            totalPages = totalCount / pageSize + 1
          }
          typeof data.success == "function" && data.success(res, currentPage, totalPages)
        } else {
          typeof data.success == "function" && data.success(res)
        }
      } else {
        if (data && data.fail && res.data.code && res.data.message) {
          typeof data.fail == "function" && data.fail({ code: res.data.code, message: res.data.message })
        } else {
          typeof data.fail == "function" && data.fail({ code: 'unknown', message: '网络请求失败，请联系管理员' })
        }
      }
    },
    fail: function (error) {
      // console.log(error);
      if (data && data.fail) {
        typeof data.fail == "function" && data.fail({ code: 'unknown', message: '网络请求失败，请联系管理员' })
      }
      if (data && data.showRetryDialog) {
        wx.showModal({
          title: '',
          content: '网络请求失败,按确定重试',
          success: function (res) {
            if (res.confirm) {
              doRequest(data)
            }
          }
        })
      }
    },
    complete: function () {
      if (showLoading) {
        wx.hideLoading()
      }
      if (data && data.complete) {
        typeof data.complete == "function" && data.complete()
      }
    }
  });
}

module.exports = {
  getRequest: getRequest,
  postRequest: postRequest,
  updateRequest: updateRequest,
  deleteRequest: deleteRequest,
  baseUrl: baseUrl,
}