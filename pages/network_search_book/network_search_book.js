Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText: '',
    array: [

    ],
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    current_page: 1,
    reachBottom: true   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      searchText:options.q
    })
    wx.showLoading({
      title: '加载中',
    })
    await this.search_book()
    wx.hideLoading()
  },
  search_book: async function (start_num,count_num) {
    try {
      let response = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://douban.uieee.com/v2/book/search',
          data:{
            q: this.data.searchText,
            start: start_num,
            count: count_num
          },
          method: 'GET',
          header: {
            'content-type': " "
          },
          success: res => {
            resolve(res)
          },
          fail: res => {
            reject(res)
          }
        })
      })

      console.log(response)

      if (start_num === 0) {
        this.setData({
          array: response.data.books,
        })
      } else {
        let arr = this.data.array
        arr.push(...response.data.books)
        this.setData({
          array: arr,
          reachBottom: response.data.books.length == 0 ? true : false
        })
      }
    } catch (error) {
      console.log(error)
      wx.showModal({
        title: '提示',
        content: `加载数据失败.${error}`
      })
    }
  },
  book_page:function(event){
    let idx=event.currentTarget.id
    let obj=this.data.array[idx]
    delete obj.catalog
    wx.navigateTo({
      url: '../scan_book/scan_book?obj='+JSON.stringify(obj),
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

  onReachBottom: function () {
    if (!this.data.reachBottom) {
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
    } else {
      if (!this.data.searchLoadingComplete) {
        this.setData({
          searchLoadingComplete: true, //把“没有数据”设为true，显示  
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏 
        });
      }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})