const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content_num:0,
    limit_content_num:500,
    focusComment :false,
    isAnonymous: false,
    content:'',
    disabled:true,
    book_id:0
  },

  input_content:function(event){
    this.setData({
      content_num: event.detail.value.length,
      content: event.detail.value,
      disabled: event.detail.value === ''
    })
  },
  /**
 * 输入框聚焦
 */
  inputFocus:function() {
    this.setData({
      focusComment: true
    })
  },

  /**
   * 输入框失去焦点
   */
  inputBlur:function() {
    this.setData({
      focusComment: false
    })
  },

  /**
   * 切换实名、匿名
   */
  anonymousChange:function(){
    const isAnonymous = this.data.isAnonymous
    this.setData({
      isAnonymous:!isAnonymous
    })
  },

  send_comment:async function(){
    try{
      user=wx.getStorageSync('userInfo')
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.book.write_comment.url,
          method: api.book.write_comment.method,
          data: {
            content: this.data.content,
            isAnonymous: this.data.isAnonymous,
            book_id:this.data.book_id,
            nickname:user.nickName,
            avatarUrl:user.avatarUrl
          },
          dataType: 'json',
          success: res => {
            resolve(res)
          },
          fail: res => {
            reject(res)
          }
        })
      })

      if(response.statusCode==401){
        wx.showLoading({
          title: '重新登录',
          mask: true
        })
        await utils.user_login()
      }

      if(response.data.code==0&&response.statusCode==200){
        wx.showToast({
          title: '评论成功',
          icon: 'success',
          duration: 2000,
          mask:true
        })
        this.setData({
          content_num: 0,
          focusComment: false,
          isAnonymous: false,
          content: '',
          disabled: true,
        })
      }

    }catch(error){
      wx.showModal({
        title: '提示',
        content: `上传评论失败.${error.errMsg}`
      })
    }
    wx.hideLoading()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      book_id: options.book_id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})