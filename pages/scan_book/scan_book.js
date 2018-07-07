const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    book_data: [],
    summary_hide:true,
    intro_hide:true,
    disabled:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let json = JSON.parse(options.obj)
    console.log(json)
    const arr = []
    arr.push(json)
    this.setData({
      book_data: arr
    })
  },
  expand:function(event){
    let tag=event.currentTarget.dataset.tag
    if(tag=='intro'){
      let val=this.data.intro_hide
      this.setData({
        intro_hide: !val
      })
    }else if(tag=='summary'){
      let val=this.data.summary_hide
      this.setData({
        summary_hide: !val
      })
    }
  },
  sendBookData :async function(){
    try{
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.book.sendBookData.url,
          method: api.book.sendBookData.method,
          data: {
            obj:this.data.book_data[0]
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
      if (response.statusCode == 200 && response.data.code == 0){
        wx.showToast({
          title: '成功加入，快去发帖告诉朋友们吧！',
          icon: 'none',
          duration: 1000,
        })
        this.setData({
          disabled:true
        })
      } else if (response.statusCode == 200 && response.data.code == 2){
        wx.showToast({
          title: '这本书已经存在啦，快去搜索它吧！',
          icon: 'none',
          duration: 1000,
        })
        this.setData({
          disabled: true
        })
      }else{
        throw Error(response.data.msg)
      }
    }catch(error){
      wx.showModal({
        title: '提示',
        content: `上传书籍数据失败.${error}`
      })
    }
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})