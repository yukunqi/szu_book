const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    navbar: ['评论我的', '我评论的'],
    currentTab: 0,
    scrollLeftValue: 0,
    current_page: 1,
    pageSize: 30,
    Type: 0,
    reachBottom: false,
    comments: [

    ]
  },
  /**
* 顶部导航栏点击事件
*/
  navbarTap: async function (e) {
    var idx = e.currentTarget.dataset.idx;
    if (this.data.currentTab != idx) {
      this.autoScrollTopNav(idx);
      this.setData({
        currentTab: idx,
        Type: idx
      })
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      await this.getMessage(1, this.data.pageSize, this.data.Type)
      wx.hideLoading()
    }
  },
  /**
 * 用于自动调整顶部类别滑动栏滑动距离，使滑动到用户可接受的合适位置，
 * 但自适应上还未考虑太周到
 * @param {number} idx - The index of currentTap.
 */
  autoScrollTopNav: function (idx) {
    if (idx <= 2) {
      this.data.scrollLeftValue = 0;
    } else {
      this.data.scrollLeftValue = (idx - 2) * 60;
    }
    this.setData({
      scrollLeftValue: this.data.scrollLeftValue
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    await this.getMessage(this.data.current_page, this.data.pageSize, this.data.Type)
    wx.hideLoading()
  },
  getMessage: async function (page, pageSize, Type) {
    try {
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.personal.my_message.url,
          method: api.personal.my_message.method,
          data: {
            pageNum: page,
            pageSize: pageSize,
            Type: Type
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
      }else if (response.data.code == 0 && response.statusCode == 200) {
        if (page === 1) {
          this.setData({
            comments: response.data.data,
            current_page: page
          })
        } else {
          let arr = this.data.comments
          arr.push(...response.data.data)
          this.setData({
            comments: arr,
            current_page: page,
            reachBottom: response.data.data.length == 0 ? true : false
          })
        }
        if (Type == 0){
          wx.setStorageSync("unreadMessageCount", response.data.unreadCount)
        }
      }else{
        throw Error(response.data.msg)
      }

    } catch (error) {
      wx.showModal({
        title: '提示',
        content: `加载数据失败.${error}`
      })
    }
    wx.hideLoading()
  },
  delete_message:async function(event){
    wx.showModal({
      title: '删除消息',
      content: '是否确定要删除这条消息',
      success: res => {
        if (res.confirm) {
          let idx=event.currentTarget.id
          this.delete_my_message(idx)
        }
      }
    })
  },
  delete_my_message: async function (idx) {
    let arr = this.data.comments
    let item = arr[idx]
    arr.splice(idx, 1)
    this.setData({
      comments: arr
    })
    try {
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.blog.delete_blogComment.url,
          method: api.blog.delete_blogComment.method,
          data: {
            blogComment_id: item.id,
            blog_id: item.blogId
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

      if (response.data.code == 0 && response.statusCode == 200) {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1000,
          mask: true
        })
      } else {
        throw Error(response.data.msg)
      }
    } catch (error) {
      arr.splice(idx, 0, item)
      this.setData({
        comments: arr
      })
      wx.showModal({
        title: '提示',
        content: `删除失败.${error}`
      })
    }
  },
  move_blog:function(event){
    let idx=event.currentTarget.id
    let comments = this.data.comments
    let blog_id=comments[idx].blogId
    let blog_author_id=comments[idx].blog_author_id
    wx.navigateTo({
      url: '../detail/detail?blog_id='+blog_id+"&blog_author_id="+blog_author_id,
    })
    console.log("after move to blog")
    this.mark_message_read(blog_id,comments,'part')
  },

  mark_message_read:async function(blog_id,comments,flag){
    let readCount=0
    let arr=[]
    if(flag == "part"){
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].blogId == blog_id && comments[i].read_status == 0) {
          comments[i].read_status = 1
          arr.push(i)
        }
      }
    }else if(flag == "all"){
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].read_status == 0){
          comments[i].read_status = 1
          arr.push(i)
        }
      }
    }
    this.setData({
      comments:comments
    })
    readCount=arr.length
    let unread = wx.getStorageSync("unreadMessageCount")
    wx.setStorageSync("unreadMessageCount",unread-readCount)
    try{

      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.personal.read_message.url,
          method: api.personal.read_message.method,
          data: {
            blog_id: blog_id,
            flag:flag
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


      if (response.data.code == 0 && response.statusCode == 200) {

      } else {
        throw Error(response.data.msg)
      }

    }catch(error){
      if (flag == "part") {
        for (let i = 0; i < arr.length; i++) {
            comments[arr[i]].read_status = 0
        }
      } else if (flag == "all") {
        for (let i = 0; i < arr.length; i++) {
            console.log(arr[i])
            comments[arr[i]].read_status = 0
        }
      }
      this.setData({
        comments: comments
      })
      let unread = wx.getStorageSync("unreadMessageCount")
      wx.setStorageSync("unreadMessageCount", unread + readCount)
      wx.showModal({
        title: '提示',
        content: `更新已读消息失败.${error}`
      })
    }
  },
  markAllread:async function(){
    let unread = wx.getStorageSync("unreadMessageCount")
    if(unread != 0){
      this.mark_message_read('',this.data.comments,'all')
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

  onPullDownRefresh: async function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    await this.getMessage(1, this.data.pageSize, this.data.Type)
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    if (!this.data.reachBottom) {
      let that = this
      that.setData({
        searchLoadingComplete: false, //把“没有数据”设为false，隐藏  
        searchLoading: true  //把"上拉加载"的变量设为true，显示  
      });

      const page = this.data.current_page + 1
      await this.getMessage(page, this.data.pageSize, this.data.Type)

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