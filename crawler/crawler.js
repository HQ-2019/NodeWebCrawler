var http = require('http')
var cheerio = require('cheerio')
var fs = require('fs')
var bufferhelper = require("bufferhelper");
var url = 'http://www.cnm.com.cn/zgqbbwg/132452/index.html'
var host = 'http://www.cnm.com.cn'
var imageSource = __dirname + '/images'   // 存放图片的目录地址

/**
 * 加载古币首页
 * @param url
 */
function loadMoneyHomeUrl(url) {
  http.get(url, function(res) {
    console.log("加载URL : " + url)

    var html = ''

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
 * @param index 列表分页的页码
 * @param moneyInfo
 */
function loadMoneyPeriodLisUrl(periodListUrl, index, moneyInfo) {
  http.get(periodListUrl, function (res) {
    var html = ''

    res.on('data', function(data) {
      html += data
    })

    res.on('end', function() {
      filterMoneyPeriodListData(html, index, moneyInfo)
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
  var info = {
    periodName: moneyInfo.periodName,
    periodCode: moneyInfo.periodCode,
    moneyName: moneyInfo.moneyName,
    moneyCode: moneyInfo.moneyCode,
    moneyContent: moneyInfo.moneyContent,
    moneyThumbnailUrl: moneyInfo.moneyThumbnailUrl,
    moneyDetailUrl: moneyInfo.moneyDetailUrl
  }
  http.get(moneyDetailUrl, function (res) {
    var html = ''

    res.on('data', function(data) {
      // 获取html网页内容
      html += data
    })

    res.on('end', function() {
      filterMoneyDetailData(html, info)
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
  console.log('古币的时代信息 : ' + periods)
  
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

    // console.log("古币时代: " + periodName + "   编码: " + item + "   URL:" + periodListUrl)
    // 加载periodListUrl获取古币列表的数据 默认页码是为0
    loadMoneyPeriodLisUrl(periodListUrl, 0, moneyInfo)
  })
}

/**
 * 对古币列表数据进行过滤
 * @param html
 */
function filterMoneyPeriodListData(html, index, moneyInfo) {
  var $ = cheerio.load(html)
  // 古币列表
  var moneyItems = $('.sc_list').children()
  // console.log("\n时代编号: " + moneyInfo.periodCode + "  时代名称: " + moneyInfo.periodName + "  古币数量: " + moneyItems.length)

  /**
   *  需要考虑到列表有分页的情况
   */

  moneyItems.each(function (item) {
    var modeyItem = $(this)

    var moneyDetailUrl = encodeURI(host + modeyItem.find('a').attr('href'))  // 古币详情页面URL
    moneyInfo.moneyName = modeyItem.find('p').find('a').text()
    moneyInfo.moneyCode = moneyInfo.periodCode + (item + 1)
    moneyInfo.moneyContent = modeyItem.find('p').text()
    moneyInfo.moneyThumbnailUrl = encodeURI(host + modeyItem.find('img').attr('src')) // URL有中文需要转义

    // console.log("古币编号: " + moneyInfo.moneyCode + "  古币名称: " + moneyInfo.moneyName + "  详情页面的URL: " + moneyDetailUrl)

    // var ext = moneyInfo.moneyThumbnailUrl.split('.').pop()  // 获取图片的格式
    var imagePath = createFilePath(moneyInfo.periodCode, moneyInfo.moneyCode + getImageFormat(moneyInfo.moneyThumbnailUrl))
    // 加载古币详情
    loadMoneyDetailUrl(moneyDetailUrl, moneyInfo)
    // 下载缩略图
    downloadImage(moneyInfo.moneyThumbnailUrl, imagePath)

  })
}

/**
 * 对古币详情数据进行过滤
 * @param html
 */
function filterMoneyDetailData(html, moneyInfo) {
  var $ = cheerio.load(html)

  var imageList = $('.w940').children()

  imageList.each(function (item) {
    var imageItem = $(this)
    var imageUrl = imageItem.find('img').attr('src')

    if (imageUrl){
      // var ext = imageUrl.split('.').pop()  // 获取图片的格式
      var imageName = moneyInfo.moneyCode + '_' + (1 + item) + getImageFormat(imageUrl)
      var imagePath = createFilePath(moneyInfo.periodCode, imageName)
      // console.log("古币编号: " + moneyInfo.moneyCode + "  古币名称: " + moneyInfo.moneyName + "详情图片存放路径: " + imagePath + "  详情图片URL: " + imageUrl)
      // 下载图片
      downloadImage(encodeURI(host + imageUrl), imagePath)
    }
  })

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