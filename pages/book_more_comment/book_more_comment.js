// pages/book_more_comment/book_more_comment.js
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
    navbar: ['热门', '最新'],
    currentTab: 0,
    scrollLeftValue: 0,
    book_id:'',
    current_page:1,
    pageSize:30,
    sortType:1,
    reachBottom:false,
    comment_people: [

    ]
  },
  /**
 * 顶部导航栏点击事件
 */
  navbarTap: async function (e) {
    var idx = e.currentTarget.dataset.idx;
    if (this.data.currentTab!=idx){
      this.autoScrollTopNav(idx);
      let sort = 0
      if (idx == 0) {
        sort = 1
      } else if (idx == 1) {
        sort = 2
      }
      this.setData({
        currentTab: idx,
        sortType: sort
      })
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      await this.comment(1, this.data.pageSize, this.data.sortType)
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
  toCollect: async function (event) {
    var list = this.data.comment_people
    var id = event.currentTarget.id

    list[id].like = !list[id].like

    if (list[id].like) {
      list[id].likes_num++
    } else {
      list[id].likes_num--
    }
    this.setData({
      comment_people: list
    });
    try {
      let response = await this.change_likes(list[id].id, list[id].like)
      if (response.data.code != 0 && response.statusCode != 200) {
        list[id].like = !list[id].like
        if (list[id].like) {
          list[id].likes_num++
        } else {
          list[id].likes_num--
        }
        this.setData({
          comment_people: list
        });
      }
    } catch (error) {
      list[id].like = !list[id].like
      if (list[id].like) {
        list[id].likes_num++
      } else {
        list[id].likes_num--
      }
      this.setData({
        comment_people: list
      });
      wx.showModal({
        title: '提示',
        content: `点赞评论失败${error.errMsg}`
      })
    }
  },
  onPullDownRefresh: async function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    await this.comment(1, this.data.pageSize, this.data.sortType)
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
      await this.comment(page, this.data.pageSize, this.data.sortType)

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
  comment: async function (page, pageSize, sortType) {
    try{
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.book.get_comment.url,
          method: api.book.get_comment.method,
          data: {
            book_id: this.data.book_id,
            pageNum: page,
            pageSize: pageSize,
            sortType: sortType
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
        if (page === 1) {
          this.setData({
            comment_people: response.data.data,
            current_page: page
          })
        } else {
          let arr = this.data.comment_people
          arr.push(...response.data.data)
          this.setData({
            comment_people: arr,
            current_page: page,
            reachBottom: response.data.data.length == 0 ? true : false
          })
        }
      }

    }catch(error){
      console.log(error)
      wx.showModal({
        title: '提示',
        content: `加载数据失败.${error.errMsg}`
      })
    }
    wx.hideLoading()
  },  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    const id=options.book_id
    this.setData({
      book_id:id
    })
    console.log("onload..."+id)
    await this.comment(this.data.current_page,this.data.pageSize, this.data.sortType)
  },
  change_likes: async function (commentId, likes) {
    return new Promise((resolve, reject) => {
      req.http_request({
        url: api.book.likes.url,
        method: api.book.likes.method,
        data: {
          book_id: this.data.book_id,
          comment_id: commentId,
          likes: likes,
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})