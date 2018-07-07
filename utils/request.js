async function request(options) {
  if (options.header) {
    options.header['x-wechat-session'] = wx.getStorageSync('_session')
    options.header['Cookie'] = wx.getStorageSync('Cookie')
  } else {
    options.header = {
      'x-wechat-session': wx.getStorageSync('_session'),
      'Cookie': wx.getStorageSync('Cookie')
    }
  }
   wx.request(options)
}

module.exports = {
  http_request: request
}