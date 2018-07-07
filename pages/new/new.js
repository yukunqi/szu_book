const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    isAnonymous: false,
    disabled: true,
    book_arr:[

    ],
    showModalStatus:false,
    search_inputShowed: false,
    search_inputVal: "",
    current_page: 1,
    search_result: [],
    reachBottom: false   
  },

  input_content: function (event) {
    this.setData({
      content: event.detail.value,
      disabled: event.detail.value === ''
    })
  },
  /**
 * 切换实名、匿名
 */
  anonymousChange() {
    const val = this.data.isAnonymous
    this.setData({
      isAnonymous: !val
    })
  },
  chooseBook:function(){
    
  },
  showInput: function () {

    this.setData({
      search_inputShowed: true
    });
  },
  hideInput: function () {

    this.setData({
      search_inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      search_inputVal: "",
      current_page:1
    });
  },
  inputTyping: function (e) {
    this.setData({
      search_inputVal: e.detail.value,
      current_page: 1
    });
  },
  searchBook: async function (event) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    await this.search_book(1)
    wx.hideLoading() 
  },

  addBook: function (event){
    const idx = event.currentTarget.id
    console.log(idx)
    let book_arr=this.data.book_arr
    let result=this.data.search_result
    let obj=result[idx]
    if(this.check_book(obj)){
      book_arr.push(obj)
    }
    result.splice(idx,1)
    this.setData({
      book_arr:book_arr,
      search_result:result
    })
  },

  check_book:function(obj){
    const arr=this.data.book_arr
    for(let i=0;i<arr.length;i++){
      if(arr[i].book_id==obj.book_id){
        return false
      }
    }
    return true
  },
  search_book: async function (pageNum) {
    try {
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.book.search_book_name.url,
          method: api.book.search_book_name .method,
          data: {
            page: pageNum,
            pageSize: 15,
            search_text: this.data.search_inputVal
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
          search_result: response.data.data,
          current_page: pageNum,
          reachBottom: response.data.data.length == 0 ? true : false
        })
      } else {
        let arr = this.data.search_result
        arr.push(...response.data.data)
        this.setData({
          search_result: arr,
          current_page: pageNum,
          reachBottom: response.data.data.length == 0 ? true : false
        })
      }
    } catch (error) {
      wx.showModal({
        title: '提示',
        content: `加载数据失败.${error.errMsg}`
      })
    }
  },


  reachBottom: function () {
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

  deleteImage: function (event) {
    const idx = event.currentTarget.id
    let arr = this.data.book_arr
    arr.splice(idx, 1)
    this.setData({
      book_arr: arr
    })
  },
  bookDetail: function (event){
    const idx = event.currentTarget.id
  },
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 100)
  },
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false,
        search_inputVal: "",
        current_page: 1,
        search_result:[]
      })
    }.bind(this), 100)
  },

  send:async function(){
    try {
      user = wx.getStorageSync('userInfo')
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.blog.write_blog.url,
          method: api.blog.write_blog.method,
          data: {
            content: this.data.content,
            isAnonymous: this.data.isAnonymous,
            book_id: this.data.book_id,
            nickname: user.nickName,
            avatarUrl: user.avatarUrl,
            link_books:this.data.book_arr
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

      if (response.statusCode == 401) {
        wx.showLoading({
          title: '重新登录',
          mask: true
        })
        await utils.user_login()
      }

      if (response.data.code == 0 && response.statusCode == 200) {
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000,
          mask: true
        })
        this.setData({
          content:'',
          focusComment: false,
          isAnonymous: false,
          disabled: true,
          book_arr:[]
        })
        wx.setStorageSync('isNeedReloadList',true)
        wx.navigateBack({
          delta:1
        });
      }

    } catch (error) {
      wx.showModal({
        title: '提示',
        content: `上传帖子失败.${error.errMsg}`
      })
    }
    wx.hideLoading()
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