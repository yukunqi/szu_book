const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api

Page({

  data: {
    tabs_list: [
      {
        'url': '../books/books'
      },
      {
        'url': '../discuss_list/discuss_list'
      },
      {
        'url': '../personal/personal'
      }
    ],
    showTabs: false,
    unreadMessagesCount: 0,
    tab: 0
  },

  switchTapTo: function (e) {
    let index = e.currentTarget.id
    index=parseInt(index)
    if(index != this.data.tab){
      this.setData({
        tab: index
      })
      let cur_component = ''
      if (this.data.tab == 0) {
        cur_component = "#b"
      } else if (this.data.tab == 1) {
        cur_component = "#d"
        console.log(cur_component)
        this.selectComponent(cur_component).onLoad();
      }else if(this.data.tab == 2){
        cur_component = "#p"
        this.selectComponent(cur_component).onShow();
      }
    }

    
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    console.log("into template onload")

    wx.showLoading({
      title: '登录中',
      mask: true
    })

    try {
      await utils.user_login()
    } catch (error) {
      wx.showModal({
        title: '提示',
        content: `用户登录失败.${error.errMsg}`
      })
    }

    try {
      await utils.getTest()
    } catch (error) {
      console.log(error)
      wx.showModal({
        title: '提示',
        content: `获取版本参数失败.${error.errMsg}`
      })
    }

    wx.hideLoading()


    const Test = wx.getStorageSync("TestVersion")
    let count = wx.getStorageSync("unreadMessageCount")
    if (Test !== "") {
      this.setData({
        showTabs: !Test,
        unreadMessagesCount:count
      })
    } else {
      this.setData({
        showTabs: false
      })
    }

    let cur_component = ''
    if (this.data.tab == 0) {
      cur_component = "#b"
    } else if (this.data.tab == 1) {
      cur_component = "#d"
    }
    console.log(cur_component)
    this.selectComponent(cur_component).onLoad();
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
    this.setData({
      unreadMessagesCount: wx.getStorageSync("unreadMessageCount")
    })
    if (this.data.tab == 1) {
      cur_component = "#d"
      this.selectComponent(cur_component).onShow();
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
    let cur_component = ''
    if (this.data.tab == 0) {
      cur_component = "#b"
    } else if (this.data.tab == 1) {
      cur_component = "#d"
    }
    this.selectComponent(cur_component).onPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let cur_component = ''
    if (this.data.tab == 0) {
      cur_component = "#b"
    } else if (this.data.tab == 1) {
      cur_component = "#d"
    }
    this.selectComponent(cur_component).onReachBottom();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})