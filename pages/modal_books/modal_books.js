const utils = require('../../utils/util.js')
const req = require('../../utils/request.js')
const api = require('../../utils/api_config.js').api


Component({
  properties: {
   
  },
  data: {
    // 这里是一些组件内部数据
    array: [
      // {
      //   'book_id':'12312',
      //   'book_name':'大问题',
      //   'book_image':'https://img3.doubanio.com/lpic/s4573783.jpg',
      //   'book_rate':'9.2',
      //   'book_author':'罗志祥',
      //   'book_year':'1982',
      //   'publisher':'中信出版社',
      //   'label':1
      // },
      // {
      //   'book_id': '12312',
      //   'book_name': '大问题',
      //   'book_image': 'https://img3.doubanio.com/lpic/s4573783.jpg',
      //   'book_rate': '9.2',
      //   'book_author': '罗志祥',
      //   'book_year': '1982',
      //   'publisher': '中信出版社',
      //   'label': 1
      // }
    ],  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    navbar: ['入门', '非入门', '新书上架'],
    currentTab: 0,
    scrollLeftValue: 0,
    search_inputShowed: false,
    search_inputVal: "",
    current_page: 1,
    reachBottom: false,
  },








  methods: {
    // 这里放置自定义方法  
    book_page: function (e) {
      var index = e.currentTarget.id
      obj = this.data.array[index]
      wx.navigateTo({
        url: '../book_page/book_page?book_obj=' + JSON.stringify(obj),
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

      tag = this.data.navbar[this.data.currentTab]
      page = this.data.current_page
      await this.loadBookData(page, tag)

      wx.hideLoading()

    },

    onPullDownRefresh: function () {
      wx.showNavigationBarLoading() //在标题栏中显示加载

      const tag = this.data.navbar[this.data.currentTab]
      this.loadBookData(1, tag)

      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新

    },

    onReachBottom: function () {
      if (!this.data.reachBottom) {
        let that = this
        that.setData({
          searchLoadingComplete: false, //把“没有数据”设为false，隐藏  
          searchLoading: true  //把"上拉加载"的变量设为true，显示  
        });

        const page = this.data.current_page + 1
        const tag = this.data.navbar[this.data.currentTab]
        this.loadBookData(page, tag)

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
     * 顶部导航栏点击事件
     */
    navbarTap: async function (e) {
      var idx = e.currentTarget.dataset.idx;
      if (idx != this.data.currentTab) {
        this.autoScrollTopNav(idx);
        this.setData({
          currentTab: idx,
          current_page: 1,
          reachBottom: false
        })

        wx.showLoading({
          title: '加载中',
          mask: true
        })
        tag = this.data.navbar[this.data.currentTab]
        page = this.data.current_page
        await this.loadBookData(page, tag)
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
    showInput: function () {
      this.setData({
        search_inputShowed: true
      });
    },
    hideInput: function () {
      this.setData({
        search_inputVal: "",
        search_inputShowed: false
      });
    },
    clearInput: function () {
      this.setData({
        search_inputVal: ""
      });
    },
    inputTyping: function (e) {
      this.setData({
        search_inputVal: e.detail.value
      });
    },
    searchBook: function (event) {
      const val = this.data.search_inputVal
      wx.navigateTo({
        url: '../search_book/search_book?search=' + val,
      })
    },

    loadBookData: async function (pageNum, tagName) {
      try {
        let response = await new Promise((resolve, reject) => {
          req.http_request({
            url: api.book.book_list.url,
            method: api.book.book_list.method,
            data: {
              page: pageNum,
              tag: tagName
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
            reachBottom: response.data.data.length == 0 ? true : false
          })
        }
      } catch (error) {
        console.log(error)
        wx.showModal({
          title: '提示',
          content: `加载数据失败.${error.errMsg}`
        })
      }

    },
    scanCode: function () {
      let that = this
      wx.scanCode({
        success: (res) => {
          let isbn = res.result
          that.scanBook_request(isbn)
        }
      })
    },
    scanBook_request: async function (isbn) {
      if (!utils.match_number(isbn)) {
        wx.showToast({
          title: '不是合法的ISBN，请重试',
          icon: 'none',
          duration: 1000,
        })
      } else {
        try {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          let resp = await new Promise((resolve, reject) => {
            wx.request({
              url: 'https://douban.uieee.com/v2/book/isbn/' + isbn,
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
          wx.hideLoading()
          if (resp.statusCode == 200) {
            wx.navigateTo({
              url: '../scan_book/scan_book?obj=' + JSON.stringify(resp.data),
            })
          } else if (resp.data.code == 6000) {
            wx.showToast({
              title: '找不到这本书的信息，不好意思',
              icon: 'none',
              duration: 1000,
            })
          } else {
            throw Error(resp.data.msg)
          }
        } catch (error) {
          wx.showModal({
            title: '提示',
            content: `扫码书籍请求失败${error}`
          })
        }
      }
    }
  }
})  