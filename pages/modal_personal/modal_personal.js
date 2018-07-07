const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api


Component({
  properties: {

  },
  data: {
    // 这里是一些组件内部数据
    userinfo: {
      avatarUrl: 'https://upload-images.jianshu.io/upload_images/1727685-0a79d3096900e806.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/300',
      nickName: '未登录'
    },
    grids: [
      {
        'name': '关于',
        'icons': '../../icons/about.png',
        'url': '../about/about'
      },
      {
        'name': '我的书评',
        'icons': '../../icons/comment.svg',
        'url': '../my_comment/my_comment'
      },
      {
        'name': '我的消息',
        'icons': '../../icons/message.svg',
        'url': '../my_message/my_message'
      },
      {
        'name': '我的帖子',
        'icons': '../../icons/message.svg',
        'url': '../my_blog/my_blog'
      }
    ]
  },


  methods: {
    // 这里放置自定义方法  
    navigate: function (event) {
      let url = event.currentTarget.dataset.url
      wx.navigateTo({
        url: url,
      })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
      userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({
          userinfo: userInfo
        })
      }
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
  }
})  