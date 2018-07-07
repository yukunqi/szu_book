const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api


Page({

  /**
   * 页面的初始数据
   */
  data: {
    'book_image':"https://img3.doubanio.com/lpic/s4573783.jpg",
    'book_title':'追风筝的人',
    'book_author':'[日]东野圭吾',
    'book_publisher':'南海出版公司',
    'publish_time':'2014-5',
    'book_rate':'9.2',
    'rate_people':'305590',
    'total_comment_count':0,
    'book_id':'1231',
    'ISBN':'134324',
    'machine_label':'1',
    'tags':[],
    'comment_people':[

    ],
    'collection':true,
    'show_comment':true,
    'obj':{}
  },

  toCollect:async function(event){
    var list = this.data.comment_people
    var id = event.currentTarget.id

    list[id].like = !list[id].like

    if (list[id].like) {
      list[id].likes_num++
    } else {
      list[id].likes_num--
    }
    this.setData({
      comment_people:list
    });
    try{
      let response=await this.change_likes(list[id].id,list[id].like)
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
    }catch(error){
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
  getmoreComment:function (event){
    if (this.data.total_comment_count>3){
      wx.navigateTo({
        url: '../book_more_comment/book_more_comment?book_id=' +this.data.book_id,
      })
    }
  },
  writeComment:function(event){
    const book_id=this.data.book_id
    if (!utils.session_existed()){
      wx.showModal({
        title: '提示',
        content: `还未授权登录 请先授权后执行.`,
        confirmText:'去授权',
        success:async function(res){
          if(res.confirm){
            wx.openSetting({
              success:async (res)=>{
                console.log(res.authSetting)
                if (res.authSetting['scope.userInfo']){
                  await utils.user_login()
                }
              }
            })
          }
        }
      })
    }else{
      wx.navigateTo({
        url: '../write_comment/write_comment?book_id=' + book_id,
      })
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let obj = JSON.parse(options.book_obj)
    this.setData({
      book_image: obj.book_image,
      book_title: obj.book_name,
      book_author: obj.book_author,
      book_publisher: obj.publisher,
      publish_time: obj.book_year,
      book_rate: obj.book_rate,
      rate_people: obj.rate_people,
      book_id: obj.book_id,
      ISBN: obj.ISBN,
      machine_label:obj.label,
      tags:obj.tags,
      obj:obj
    })

    const Test = wx.getStorageSync("TestVersion")
    if (Test !== '') {
      this.setData({
        show_comment: !Test
      })
    } else {
      this.setData({
        show_comment: false
      })
    }

    try{
      let response=await this.getcomment(1,3,1)
      console.log(response)
      if (response.statusCode == 401) {
        wx.showLoading({
          title: '重新登录',
          mask: true
        })
        await utils.user_login()
      }
      if (response.data.code == 0 && response.statusCode == 200) {
        this.setData({
          comment_people: response.data.data,
          total_comment_count: response.data.comment_size
        })
      }
    }catch(error){
      wx.showModal({
        title: '提示',
        content: `获取书籍评论失败${error.errMsg}`
      })
    }
    wx.hideLoading()
  },

  getcomment: async function(page,pageSize,sortType){
    return new Promise((resolve, reject) => {
      req.http_request({
        url: api.book.get_comment.url,
        method: api.book.get_comment.method,
        data: {
          book_id: this.data.book_id,
          pageNum:page,
          pageSize:pageSize,
          sortType:sortType
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
  change_likes:async function(commentId,likes){
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
  tagSearch:function(event){
    const index = event.currentTarget.id
    let val=this.data.tags[index]
    wx.navigateTo({
      url: '../search_book/search_book?search=' + val,
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
  onPullDownRefresh:async function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    try {
      let response = await this.getcomment(1, 3, 1)
      if (response.statusCode == 401) {
        wx.showLoading({
          title: '重新登录',
          mask: true
        })
        await utils.user_login()
      }
      if (response.data.code == 0 && response.statusCode == 200) {
        this.setData({
          comment_people: response.data.data,
          total_comment_count: response.data.comment_size
        })
      }
    } catch (error) {
      wx.showModal({
        title: '提示',
        content: `获取书籍评论失败${error.errMsg}`
      })
    }
    wx.hideLoading()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
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
    let obj=this.data.obj
    return {
      title: '分享一本好书 《'+obj.book_name+'》 给你',
      path: '/pages/book_page/book_page?book_obj=' + JSON.stringify(obj),
      success: function (res) {
        
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '分享失败',
        })
      }
    }
  }
})