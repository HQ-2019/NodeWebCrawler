var http = require('http')
var cheerio = require('cheerio')
var fs = require('fs')
var moneyController = require('./controller/moneyController')
var url = 'http://www.cnm.com.cn/zgqbbwg/132452/index.html'
var host = 'http://www.cnm.com.cn'
var imageSource = __dirname + '/images'   // 存放图片的目录地址
var imageHost = 'http://download.iqianzhan.com/'


/**
 * 加载古币首页
 * @param url
 */
function loadMoneyHomeUrl(url) {
  http.get(url, function(res) {
    console.log("加载URL : " + url)
    var html = ''
    res.setEncoding('utf-8')
    res.on('data', function(data) {
      // 获取html网页内容
      html += data
    })

    res.on('end', function() {
      filterMoneyHomeData(html)
    })
  }).on('error', function(error) {
    console.error('获取数据出错！' + error)
  })
}

/**
 * 加载对应古币时代的列表页
 * @param periodListUrl
 * @param pageIndex 列表分页的页码
 * @param lastPageItemNumer 上个页面的古币个数
 * @param moneyInfo
 */
function loadMoneyPeriodLisUrl(periodListUrl, pageIndex,  lastPageItemNumer, moneyInfo) {
  http.get(periodListUrl, function (res) {
    var html = ''
    res.setEncoding('utf-8')
    res.on('data', function(data) {
      html += data
    })

    res.on('end', function() {
      filterMoneyPeriodListData(html, pageIndex, lastPageItemNumer,  moneyInfo)
    })
  }).on('error', function(error) {
    console.error('获取periodListUrl出错！' + error)
  })
}

/**
 * 加载对应古币详情页
 * @param moneyDetailUrl
 */
function loadMoneyDetailUrl(moneyDetailUrl, moneyInfo) {
  http.get(moneyDetailUrl, function (res) {
    var html = ''
    res.setEncoding('utf-8')
    res.on('data', function(data) {
      // 获取html网页内容
      html += data
    })

    res.on('end', function() {
      filterMoneyDetailData(html, moneyInfo)
    })
  }).on('error', function(error) {
    console.error('获取moneyDetailUrl出错！' + error)
  })
}

// 获取html内容 使用cheerio模块
function filterMoneyHomeData(html) {
  // 将html内容装载到cheerio
  var $ = cheerio.load(html)
  
  var periods = $('.left_nav').children()
  periods.each(function (item) {
    var periodItem = $(this)

    // 某个时期的古币列表链接
    var periodListUrl = encodeURI(host + periodItem.find('a').attr('href'))
    // 古币的时代
    var periodName = periodItem.text()
    // 古币时代的编码
    var periodCode = 1000 * (item + 1)
    // 古币的名称
    var moneyName = ""
    // 古币的编码
    var moneyCode = ""
    // 古币的描述
    var moneyContent = ""
    // 古币缩略图URL
    var moneyThumbnailUrl = ""
    // 古币详情的图片URL (多个URL之前用";"拼接)
    var moneyDetailUrl = ""

    var moneyInfo = {
      periodName: periodName,
      periodCode: periodCode,
      moneyName: moneyName,
      moneyCode: moneyCode,
      moneyContent: moneyContent,
      moneyThumbnailUrl: moneyThumbnailUrl,
      moneyDetailUrl: moneyDetailUrl
    }

    console.log("古币时代: " + periodName + "   编码: " + item + "   URL:" + periodListUrl)
    // 加载periodListUrl获取古币列表的数据 默认页码是为1
    loadMoneyPeriodLisUrl(periodListUrl, 1, 0, moneyInfo)
  })
}

/**
 * 对古币列表数据进行过滤
 * @param periodListUrl
 * @param pageIndex 列表分页的页码
 * @param lastPageItemNumer 上个页面的古币个数
 * @param moneyInfo
 */
function filterMoneyPeriodListData(html, index, lastPageItemNumer, moneyInfo) {
  var $ = cheerio.load(html)
  // 古币列表
  var moneyItems = $('.sc_list').children()
  console.log("\n时代编号: " + moneyInfo.periodCode + "  时代名称: " + moneyInfo.periodName + "  页面: " + index + "  古币数量: " + moneyItems.length)

  // 获取当前页的数据
  moneyItems.each(function (item) {
    var modeyItem = $(this)

    var moneyDetailUrl = encodeURI(host + modeyItem.find('a').attr('href'))  // 古币详情页面URL
    var info = {
      periodName: moneyInfo.periodName,
      periodCode: moneyInfo.periodCode,
      moneyName: moneyInfo.moneyName,
      moneyCode: moneyInfo.moneyCode,
      moneyContent: moneyInfo.moneyContent,
      moneyThumbnailUrl: moneyInfo.moneyThumbnailUrl,
      moneyDetailUrl: moneyInfo.moneyDetailUrl
    }
    info.moneyName = modeyItem.find('p').find('a').text()
    info.moneyCode = moneyInfo.periodCode + (item + 1 + lastPageItemNumer)
    // info.moneyContent = modeyItem.find('p').text()
    var thumbnailUrl = encodeURI(host + modeyItem.find('img').attr('src')) // URL有中文需要转义
    info.moneyThumbnailUrl = imageHost + info.moneyCode + getImageFormat(thumbnailUrl)

    var imagePath = createFilePath(info.periodCode, info.moneyCode + getImageFormat(thumbnailUrl))

    console.log("古币编号: " + info.moneyCode + "  古币名称: " + info.moneyName + "  页面: " + index + "  详情页面的URL: " + moneyDetailUrl)
    // 加载古币详情
    loadMoneyDetailUrl(moneyDetailUrl, info)
    // 下载缩略图 (当图片还未存在时)
    if (!fsExistsSync(imagePath)) {
      downloadImage(thumbnailUrl, imagePath)
    }
  })

  // 获取下一页的页码和地址
  var pageNumber = $('.pagingNormal').text()

  // 判断是否还有更多的分页
  if (pageNumber > index) {
    var onclick = $('.pagingNormal').attr('onclick')
    var array = onclick.match(/zgqbbwg(\S*)html/);
    var pageUrl = host + '/' + array[0]
    console.log('当前页码:' +  pageNumber + "  标签: " + pageUrl + "  点击事件: " + onclick)
    // $('.pagingNormal').map(function (I, page) {
    //   console.log('页码: ' + page.attr('onclick') )
    // })

    loadMoneyPeriodLisUrl(pageUrl, pageNumber, moneyItems.length, moneyInfo)
  }
}

/**
 * 对古币详情数据进行过滤
 * @param html
 */
function filterMoneyDetailData(html, moneyInfo) {
  var $ = cheerio.load(html)

  var imageList = $('.w940').children()

  var url = ''
  imageList.each(function (item) {
    var imageItem = $(this)
    var imageUrl = imageItem.find('img').attr('src')

    var content = imageItem.text()
    if (content.length > 0) {
      moneyInfo.moneyContent = content
    }

    if (imageUrl){
      imageUrl = host + imageUrl
      url =  url + (url.length > 0 ? ';' : '') + imageUrl
      var imageName = moneyInfo.moneyCode + '_' + (1 + item) + getImageFormat(imageUrl)
      var imagePath = createFilePath(moneyInfo.periodCode, imageName)
      console.log("古币编号: " + moneyInfo.moneyCode + "  古币名称: " + moneyInfo.moneyName + "  详情图片存放路径: " + imagePath + "  详情图片URL: " + imageUrl)
      // 下载图片 (当图片还未存在时 )
      if (!fsExistsSync(imagePath)) {
        downloadImage(encodeURI(imageUrl), imagePath)
      }
    }
  })

  // 将数据入库
  moneyInfo.moneyDetailUrl = url
  var result = moneyController.insertItem(moneyInfo)
  if (result) {
  }
}

/**
 * 下载图片存放到指定位置
 * @param imageUrl
 * @param savePath
 */
function downloadImage(imageUrl, savePath) {
  http.get(imageUrl, function(res) {

    var imageData = ''
    res.setEncoding('binary') // 一定要设置 否则本地图片无法打开
    res.on('data', function(chunk) {
      imageData += chunk
    })

    res.on('end', function() {
      // 写入目标路径
      fs.writeFile(savePath, imageData, 'binary', function(err){
        if(err) {
          console.error("图片写入 失败 " + err)
        } else  {
          console.log("图片写入 成功  " + savePath);
        }
      })
    })
  }).on('error', function(error) {
    console.error('下载图片出错: ' + error)
  })
}

/**
 * 创建图片路径
 * @param path
 * @param imageName
 * @returns {string}
 */
function createFilePath(path, imageName) {
  var filePath = imageSource + '/' + path
  // 目录不存在则创建
  if (!fsExistsSync(filePath)) {
    fs.mkdir(filePath, function(err){
      if (err) {
        return console.error(err);
      }
      console.log("目录创建成功: " + filePath);
    });
  }
  var imagePath = filePath + '/' + imageName
  return imagePath
}

/**
 * 检测文件或者文件夹存在
 * @param path
 * @returns {boolean}
 */
function fsExistsSync(path) {
  try{
    fs.accessSync(path,fs.F_OK);
  } catch(e) {
    return false;
  }
  return true;
}

/**
 * 从图片URL中读取图片命名的格式
 * @param imageUrl
 */
function getImageFormat(imageUrl) {
  var ext = imageUrl.split('.').pop()  // 获取图片的格式
  return '.' + ext
}

// 设置启动项
loadMoneyHomeUrl(url)