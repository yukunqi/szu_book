const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api


Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment_arr:[

    ],
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    current_page: 1,
    pageSize:30
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    await this.mycomment(1,this.data.pageSize,2)
    wx.hideLoading()
  },
  mycomment: async function (page, pageSize, sortType) {
    try {
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.personal.my_comment.url,
          method: api.personal.my_comment.method,
          data: {
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
            comment_arr: response.data.data,
            current_page: page
          })
        } else {
          let arr = this.data.comment_arr
          arr.push(...response.data.data)
          this.setData({
            comment_arr: arr,
            current_page: page,
            reachBottom: response.data.data.length == 0 ? true : false
          })
        }
      }

    } catch (error) {
      console.log(error)
      wx.showModal({
        title: '提示',
        content: `加载数据失败.${error.errMsg}`
      })
    }
    wx.hideLoading()
  },
  onPullDownRefresh: async function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    await this.mycomment(1, this.data.pageSize, 2)
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
      await this.mycomment(page, this.data.pageSize, 2)

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
  toCollect: async function (event) {
    var list = this.data.comment_arr
    var id = event.currentTarget.id

    list[id].like = !list[id].like

    if (list[id].like) {
      list[id].likes_num++
    } else {
      list[id].likes_num--
    }
    this.setData({
      comment_arr: list
    });
    try {
      let response = await this.change_likes(list[id].id, list[id].like,list[id].book_id)
      if (response.data.code != 0 && response.statusCode != 200) {
        list[id].like = !list[id].like
        if (list[id].like) {
          list[id].likes_num++
        } else {
          list[id].likes_num--
        }
        this.setData({
          comment_arr: list
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
        comment_arr: list
      });
      wx.showModal({
        title: '提示',
        content: `点赞评论失败${error.errMsg}`
      })
    }
  },
  change_likes: async function (commentId, likes,book_id) {
    return new Promise((resolve, reject) => {
      req.http_request({
        url: api.book.likes.url,
        method: api.book.likes.method,
        data: {
          book_id:book_id,
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

  delete_comment:async function(event){
    wx.showModal({
      title: '删除评论',
      content: '是否确定要删除这条评论',
      success:res=>{
        if(res.confirm){
            this.delete_post(event)
        }
      }
    })
  },

  delete_post:async function(event){
    var list = this.data.comment_arr
    var id = event.currentTarget.id
    let comment_id = list[id].id
    ele = list.splice(id, 1)

    this.setData({
      comment_arr: list
    })

    try {
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.personal.delete_comment.url,
          method: api.personal.delete_comment.method,
          data: {
            comment_id: comment_id,
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
        wx.hideLoading()
      }

      if (response.data.code == 0 && response.statusCode == 200) {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000,
          mask: true
        })
      }else{
        throw Error(response.data.msg)
      }
    } catch (error) {
      list.splice(id, 0, ele[0])
      this.setData({
        comment_arr: list
      })
      wx.showModal({
        title: '提示',
        content: `删除评论失败.${error}`
      })
    }
  },

  move:function(event){
    let item = this.data.comment_arr[event.currentTarget.id]
    obj={
      'book_id':item['book_id'],
      'book_image': item['book_image'],
      'book_name': item['book_name'],
      'book_author': item['book_author'],
      'publisher': item['publisher'],
      'book_year': item['book_year'],
      'book_rate': item['book_rate'],
      'rate_people': item['rate_people'],
      'ISBN': item['ISBN'],
    }
    wx.navigateTo({
      url: '../book_page/book_page?book_obj=' + JSON.stringify(obj),
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