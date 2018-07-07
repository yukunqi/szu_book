const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText:'',
    array: [

    ],
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    current_page: 1,
    pageSize:30,
    reachBottom:false   
  },
  book_page: function (e) {
    var index = e.currentTarget.id
    obj = this.data.array[index]
    wx.navigateTo({
      url: '../book_page/book_page?book_obj=' + JSON.stringify(obj),
    })
  },
  onReachBottom: function () {
    if (!this.data.reachBottom){
      let that = this
      that.setData({
        searchLoadingComplete: false, //把“没有数据”设为false，隐藏  
        searchLoading: true  //把"上拉加载"的变量设为true，显示  
      });

      const page = this.data.current_page + 1
      this.search_book(page)

      that.setData({
        searchLoadingComplete: false, //把“没有数据”设为true，显示  
        searchLoading: false  //把"上拉加载"的变量设为false，隐藏 
      });
    }else{
      if (!this.data.searchLoadingComplete){
        this.setData({
          searchLoadingComplete: true, //把“没有数据”设为true，显示  
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏 
        });
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      searchText:options.search
    })
    page = this.data.current_page
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    await this.search_book(page, options.search)
    wx.hideLoading()
  },
  search_book: async function (pageNum){
    try {
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.book.search.url,
          method: api.book.search.method,
          data: {
            page: pageNum,
            pageSize: this.data.pageSize,
            search_text: this.data.searchText
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

      console.log(response)

      if (pageNum === 1) {
        this.setData({
          array: response.data.data,
          current_page: pageNum
        })
      } else {
        let arr = this.data.array
        arr.push(...response.data.data)
        this.setData({
          array: arr,
          current_page: pageNum,
          reachBottom: response.data.data.length==0?true:false
        })
      }
    } catch (error) {
      wx.showModal({
        title: '提示',
        content: `加载数据失败.${error.errMsg}`
      })
    }
  },
  network_search:async function(){
    let text = this.data.searchText
    wx.navigateTo({
      url: '../network_search_book/network_search_book?q='+text,
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})