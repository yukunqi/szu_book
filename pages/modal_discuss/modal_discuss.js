const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api


Component({
  properties: {

  },
  data: {
    // 这里是一些组件内部数据
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    current_page: 1,
    reachBottom: false,
    blogList: []
  },



  methods: {
    move_detail: function (event) {
      let idx = event.currentTarget.id
      let obj = this.data.blogList[idx]
      wx.navigateTo({
        url: '../detail/detail?blog_id=' + obj.id + "&blog_author_id=" + obj.author_id,
      })
    },
    bookDetail: function (event) {
      let obj = event.currentTarget.dataset
      console.log(obj.blog_index)
      console.log(obj.book_index)
      let book_obj = this.data.blogList[obj.blog_index].link_books[obj.book_index]
      console.log(book_obj)
      wx.navigateTo({
        url: '../book_page/book_page?book_obj=' + JSON.stringify(book_obj),
      })
    },
    newMessage: function () {
      wx.navigateTo({
        url: '../new/new',
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
      page = this.data.current_page
      await this.loadBlogData(page)
      wx.hideLoading()
    },
    loadBlogData: async function (pageNum) {
      try {
        let response = await new Promise((resolve, reject) => {
          req.http_request({
            url: api.blog.blog_list.url,
            method: api.blog.blog_list.method,
            data: {
              page: pageNum
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

        if (response.statusCode == 401) {
          wx.showLoading({
            title: '重新登录',
            mask: true
          })
          await utils.user_login()
        }
        if (response.data.code == 0 && response.statusCode == 200) {
          if (pageNum === 1) {
            this.setData({
              blogList: response.data.data,
              current_page: pageNum
            })
          } else {
            let arr = this.data.blogList
            arr.push(...response.data.data)
            this.setData({
              blogList: arr,
              current_page: pageNum,
              reachBottom: response.data.data.length == 0 ? true : false
            })
          }
        }
      } catch (error) {
        wx.showModal({
          title: '提示',
          content: `加载数据失败.${error.errMsg}`
        })
      }
      wx.hideLoading()
    },
    toCollect: async function (event) {
      var list = this.data.blogList
      var id = event.currentTarget.id

      list[id].like = !list[id].like

      if (list[id].like) {
        list[id].likes_num++
      } else {
        list[id].likes_num--
      }
      this.setData({
        blogList: list
      });
      try {
        let response = await utils.change_Bloglikes(list[id].id, list[id].like)
        if (response.data.code != 0 && response.statusCode != 200) {
          throw Error(response.data.msg)
        }
      } catch (error) {
        list[id].like = !list[id].like
        if (list[id].like) {
          list[id].likes_num++
        } else {
          list[id].likes_num--
        }
        this.setData({
          blogList: list
        });
        wx.showModal({
          title: '提示',
          content: `点赞帖子失败${error}`
        })
      }
    },
    showMore: function (event) {
      let that = this
      wx.showActionSheet({
        itemList: ['删除帖子'],
        success: function (res) {
          if (res.tapIndex == 0) {
            wx.showLoading({
              title: '删除中',
              mask: true
            })
            try {
              let idx = event.currentTarget.id
              let obj = that.data.blogList[idx]
              let list = that.data.blogList
              list.splice(idx, 1)
              that.setData({
                blogList: list
              })
              utils.delete_blog(obj.id)
            } catch (error) {
              list.splice(idx, 0, obj)
              that.setData({
                blogList: list
              })
              wx.showModal({
                title: '提示',
                content: `删除帖子失败.${error}`
              })
            }

            wx.hideLoading()
          }
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
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
    onShow: async function () {
      const isNeedReloadList = wx.getStorageSync('isNeedReloadList')
      console.log("on show ",isNeedReloadList)
      if (isNeedReloadList) {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        page = this.data.current_page
        await this.loadBlogData(page)
        wx.hideLoading()
        wx.setStorageSync("isNeedReloadList", false)
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
    onPullDownRefresh: async function () {
      wx.showNavigationBarLoading() //在标题栏中显示加载
      this.setData({
        reachBottom: false
      })
      await this.loadBlogData(1)
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
        await this.loadBlogData(page)
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
  }
})  