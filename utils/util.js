const api=require('api_config.js').api
const req = require('request.js')

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


async function login(){
  return new Promise((reslove,reject)=>{
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        reslove(res)
      },
      fail:res =>{
        reject(res)
      }
    })
  })
}

async function getUserINFO(){
  return new Promise((resolve,reject)=>{
    wx.getUserInfo({
      withCredentials:true,
      success: res=>{
        resolve(res)
      },
      fail: res=>{
        reject(res)
      }
    })
  })
}


async function user_login(){
  try{
    const loginCode = await login()
    const userinfo = await getUserINFO()
    userinfo.code=loginCode.code
    let resp=await new Promise((resolve,reject)=>{
      wx.request({
        url: api.user.login.url,
        method:api.user.login.method,
        data:{
          'wechat-code': userinfo.code,
          'wechat-encryptedData': userinfo.encryptedData,
          'wechat-iv': userinfo.iv
        },
        dataType:'json',
        success:res=>{
          resolve(res)
        },
        fail:res=>{
          reject(res)
        }
      })
    })

    wx.setStorageSync('userInfo', userinfo.userInfo)
    wx.setStorageSync('_session',resp.data.data.session)
    wx.setStorageSync('Cookie',resp.header['Set-Cookie'])
    wx.setStorageSync('userId', resp.data.data.userId )
    wx.setStorageSync("unreadMessageCount", resp.data.data.unreadMessageCount)
  }catch(error){
    console.log(error)
    if (error.errMsg.indexOf("getUserInfo:fail auth deny")==-1){
      wx.showModal({
        title: '提示',
        content: `获取用户信息失败，请关闭重新进入。${error}`
      })
    }else{
      let word=''
      if(session_existed()){
        word = '登录过期，请授权我们更新您的最新用户信息'
      }else{
        word='您还未登录，登录后即可体验'
      }
      wx.showModal({
        title: '提示',
        content: word,
        confirmText: '去授权',
        success: async function (res) {
          if (res.confirm) {
            wx.openSetting({
              success: async (res) => {
                console.log(res.authSetting)
                if (res.authSetting['scope.userInfo']) {
                  await user_login()
                }
              }
            })
          }
        }
      })
    }
  }
}

//去判断是测试版本还是正常版本
async function getTest(){
  let response= await new Promise((resolve, reject) => {
    req.http_request({
      url: api.user.Test.url,
      method: api.user.Test.method,
      data: {
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
  wx.setStorageSync('TestVersion', response.data.data.TestVersion)
}

async function change_Bloglikes (blog_id,like) {
  return new Promise((resolve, reject) => {
    req.http_request({
      url: api.blog.blog_likes.url,
      method: api.blog.blog_likes.method,
      data: {
        blog_id:blog_id,
        likes:like
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
}

async function delete_blog(blog_id) {
  return new Promise((resolve, reject) => {
    req.http_request({
      url: api.blog.delete_blog.url,
      method: api.blog.delete_blog.method,
      data: {
        blog_id: blog_id,
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
}



 function session_existed(){
  const s=wx.getStorageSync('_session')
  if(s===""){
    return false
  }else{
    return true
  }
}

function remove(arr,idx){

  if (isNaN(idx) || idx > arr.length) { return false; }
  temp=[]
  for (var i = 0, n = 0; i < arr.length; i++) {
    if (i != idx) {
      temp[n++] = arr[i]
    }
  } 
  return temp
}

function match_number(str){
  let patten =/^-?[1-9]\d*$/
  const b=patten.test(str)
  return b
}

module.exports = {
  formatTime: formatTime,
  user_login: user_login,
  session_existed: session_existed,
  remove:remove,
  match_number: match_number,
  change_Bloglikes: change_Bloglikes,
  delete_blog: delete_blog,
  getTest: getTest
}
