const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    blog: [

    ],
    comments: [

    ],
    isAnonymous:false,
    loading: false,
    placeholder: '写点评论...',
    focusComment: false,
    disable: true,
    comment: '',
    replyTo: '',
    inputContent: '',
    current_page:1,
    receive_id:'',
    receive_name:'',
    comment_status: 0, //0代表评论的是帖子 1代表评论的是用户
    likes_num:0,
    commentNum:0,
    like:false,
    blog_id:'',
    blog_author_id:''
  },

  showMore:async function(){
    let that=this
    wx.showActionSheet({
      itemList: ['删除帖子'],
      success: function (res) {
        if(res.tapIndex == 0){
          wx.showLoading({
            title: '删除中',
            mask: true
          })
          utils.delete_blog(that.data.blog[0].id)
          wx.hideLoading()
        }
      }
    })
  },


  /**
   * 切换实名、匿名
   */
  anonymousChange() {
    const val = this.data.isAnonymous
    this.setData({
      isAnonymous:!val
    })
  },
  /**
* 输入框聚焦
*/
  inputFocus: function () {
    this.setData({
      focusComment: true
    })
  },

  /**
   * 输入框失去焦点
   */
  inputBlur: function () {
    this.setData({
      focusComment: false,
    })
  },

  input_content: function (event) {
    this.setData({
      inputContent: event.detail.value,
      disable: event.detail.value === ''
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let blog_id=options.blog_id
    let blog_author_id=options.blog_author_id
    console.log(blog_id+"    "+blog_author_id)
    this.setData({
      blog_id:blog_id,
      blog_author_id:blog_author_id
    })
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    await this.getBlogDetail()
    wx.hideLoading()
  },
  sendComment:async function(){
    await this.send(this.data.receive_id, this.data.receive_name,this.data.comment_status)
  },
  send:async function(receive_id,receive_name,comment_status){
    let Num = this.data.commentNum
    Num=Num+1
    this.setData({
      commentNum: Num
    })
    try {
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.blog.write_blog_comment.url,
          method: api.blog.write_blog_comment.method,
          data: {
            content: this.data.inputContent,
            blog_author_id: this.data.blog[0].author_id,
            blog_author_name: this.data.blog[0].nickName,
            blog_author_Anonymous: this.data.blog[0].author_Anonymous,
            blog_id:this.data.blog[0].id,
            isAnonymous: this.data.isAnonymous,
            receive_id: receive_id,
            receive_name: receive_name,
            comment_status:comment_status
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
        this.setData({
          focusComment: false,
          isAnonymous: false,
          inputContent: '',
          disable: true,
        })

        wx.showToast({
          title: '评论成功',
          icon: 'success',
          duration: 1000,
          mask: true
        })

        await this.getBlogDetail()

      }else{
        throw Error(response.data.msg)
      }

    } catch (error) {
      let Num = this.data.commentNum
      Num=Num-1
      this.setData({
        commentNum: Num
      })
      wx.showModal({
        title: '提示',
        content: `上传帖子评论失败.${error}`
      })
    }
    wx.hideLoading()
  },
  clearInput: async function(){
    console.log("clear input")
    this.setData({
      inputContent:""
    })
  },
  getBlogDetail:async function(){
    try {
      let response = await new Promise((resolve, reject) => {
        req.http_request({
          url: api.blog.get_blogDetail.url,
          method: api.blog.get_blogDetail.method,
          data: {
            blog_id: this.data.blog_id,
            blog_author_id: this.data.blog_author_id
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

          let obj = response.data.data
          if(obj.length==0){
            await wx.showToast({
              title: '帖子不存在',
              mask:true,
              icon:'loading',
              duration:4000,
              complete:(res)=>{
                wx.navigateBack({
                  delta:1
                })
              }
            })
          }else{
            this.setData({
              comments: obj[0].comments,
              blog: obj,
              likes_num: obj[0].likes_num,
              commentNum: obj[0].commentNum,
              like: obj[0].like,
              receive_id: obj[0].author_id,
              receive_name: "",
              comment_status: 0
            })
          }
          

      }else{
        throw Error(response.data.msg)
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

  itemAction:function(event){
    let userId=wx.getStorageSync('userId')
    let idx=event.currentTarget.id
    let item=this.data.comments[idx]
    List=[]

    if(item.author_id==userId){
      List.push('删除评论')
    }else{
      List.push("回复 " + item.author_name + " :")
    }

    let that=this
    wx.showActionSheet({
      itemList: List,
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0 && List[res.tapIndex].indexOf('删除评论') != -1) {     
          wx.showModal({
            title: '删除',
            content: '是否确定要删除这条评论?',
            success: res => {
              if (res.confirm) {
                that.delete_blogComment(item.id,idx)
              }
            }
          })
        }else{
          that.setData({
            focusComment: true,
            placeholder: List[res.tapIndex],
            receive_id:item.author_id,
            receive_name:item.author_name,
            inputContent: '',
            comment_status:1
          })
        }
      }
    })
  },

  delete_blogComment:async function(comment_id,idx){
      let arr=this.data.comments
      let Num = this.data.commentNum
      Num=Num-1
      let item=arr[idx]
      arr.splice(idx,1)
      this.setData({
        comments:arr,
        commentNum: Num
      })
      try {
        let response = await new Promise((resolve, reject) => {
          req.http_request({
            url: api.blog.delete_blogComment.url,
            method: api.blog.delete_blogComment.method,
            data: {
              blogComment_id: comment_id,
              blog_id:this.data.blog[0].id
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
            duration: 2000,
            mask: true
          })
        }else{
          throw Error(response.data.msg)
        }
      } catch (error) {
        arr.splice(idx, 0, item)
        let Num = this.data.commentNum
        Num=Num+1
        this.setData({
          comments: arr,
          commentNum: Num
        })
        wx.showModal({
          title: '提示',
          content: `删除失败.${error}`
        })
      }
  },
  sendBlogComment:function(){
    console.log("send blog comment")
    this.setData({
      focusComment: true,
      placeholder: '写点评论...',
      receive_id: this.data.blog[0].author_id,
      receive_name: "",
      comment_status:0
    })
  },
  toCollect: async function (event) {

    let m_like=this.data.like
    let num = this.data.likes_num
    m_like=!m_like
    if (m_like) {
      num++
    } else {
      num--
    }
    this.setData({
      like: m_like,
      likes_num:num
    });
    try {
      let response = await utils.change_Bloglikes(this.data.blog[0].id,m_like)
      if (response.data.code != 0 && response.statusCode != 200) {
        throw Error(response.data.msg)
      }
    } catch (error) {
      let m_like = this.data.like
      let num = this.data.like_num
      m_like = !m_like
      if (m_like) {
        num++
      } else {
        num--
      }
      this.setData({
        like: m_like,
        likes_num: num
      });
      wx.showModal({
        title: '提示',
        content: `点赞帖子失败${error}`
      })
    }
  },
  BookDetail:function(event){
    let idx = event.currentTarget.id
    let book_obj = this.data.blog[0].link_books[idx]
    console.log(book_obj)
    wx.navigateTo({
      url: '../book_page/book_page?book_obj=' + JSON.stringify(book_obj),
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
  onPullDownRefresh: async function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    let response = await this.getBlogDetail()
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
    
  }
})