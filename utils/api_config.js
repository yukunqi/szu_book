// ENV
const env = 'production' // 'development' or 'production'

// WXAPP VERSION
const version = 2.0

// development and production host
const hosts = {
  development: 'http://localhost:22555',
  production: 'https://harrisyu.com'
}

const api={
  user:{
    login:{
      method:'POST',
      url:'/user/wxlogin'
    },
    Test:{
      method:'GET',
      url:'/user/Test'
    }
  },
  book:{
    book_list:{
      method:'GET',
      url:'/book/getBookList'
    },
    write_comment:{
      method:'POST',
      url:'/session/book/write_comment'
    },
    get_comment:{
      method:'GET',
      url:'/session/book/get_comment'
    },
    likes:{
      method:'POST',
      url:'/session/book/likes'
    },
    search:{
      method:'GET',
      url:'/search'
    },
    search_book_name:{
      method:'GET',
      url:'/search_book_name'
    },
    sendBookData:{
      method:'POST',
      url:'/book/sendBookData'
    }
  },
  personal:{
    my_comment:{
      method:'GET',
      url:'/session/personal/my_comment'
    },
    delete_comment:{
      method:'POST',
      url:'/delete/comment'
    },
    my_message:{
      method:'GET',
      url:'/session/personal/my_message'
    },
    read_message:{
      method:'POST',
      url:'/session/personal/mark_read'
    }
  },
  blog:{
    write_blog:{
      method:'POST',
      url:'/session/blog/write_blog'
    },
    blog_list:{
      method:'GET',
      url:'/session/blog/getBlogList'
    },
    my_blog_list:{
      method:'GET',
      url:'/session/blog/getMyBlogList'
    },
    write_blog_comment:{
      method:'POST',
      url:'/session/blog/write_blog_comment'
    },
    get_blogDetail:{
      method:'GET',
      url:'/session/blog/get_blogDetail'
    },
    delete_blogComment:{
      method:'POST',
      url:'/delete/blogComment'
    },
    blog_likes:{
      method:'POST',
      url:'/session/blog/likes'
    },
    delete_blog:{
      method:'POST',
      url:'/delete/blog'
    }
  }
}

module.exports = {
  env,
  version,
  api: disposeUrl(api, hosts[env])
}

function disposeUrl(obj, prefix) {
  Object.keys(obj).forEach(v => {
    if (obj[v].url) {
      obj[v].url = prefix + obj[v].url
    } else {
      obj[v] = disposeUrl(obj[v], prefix)
    }
  })

  return obj
}