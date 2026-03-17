import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import dayjs from "dayjs/esm"

// 中华网要闻 (首页)
const chinanews = defineSource(async () => {
  const baseURL = "https://news.china.com"
  const url = `${baseURL}/`
  const response = await myFetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
  }) as any
  
  const $ = load(response)
  const news: NewsItem[] = []
  
  // 选择要闻列表 - 第一个 .item_list
  const $items = $("#js-news-media .item_list").first().find("li")
  
  $items.each((_, el) => {
    const $el = $(el)
    const $titleLink = $el.find(".item_title a")
    const href = $titleLink.attr("href") || ""
    const title = $titleLink.text().trim()
    const source = $el.find(".item_info .item_source").text().trim()
    const timeText = $el.find(".item_info .item_time").text().trim()
    
    if (href && title) {
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      const id = href.split("/").pop() || href
      
      news.push({
        url: fullUrl,
        title,
        id: `chinanews-${id}`,
        extra: {
          info: source || "中华网",
          date: timeText ? dayjs(timeText).valueOf() : Date.now(),
        }
      })
    }
  })
  
  return news.slice(0, 30)
})

// 中华国内
const domestic = defineSource(async () => {
  const baseURL = "https://news.china.com"
  const url = `${baseURL}/domestic/`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []
  
  const $items = $(".item_list li")
  
  $items.each((_, el) => {
    const $el = $(el)
    const $titleLink = $el.find(".item_title a")
    const href = $titleLink.attr("href") || ""
    const title = $titleLink.text().trim()
    const timeText = $el.find(".item_info .item_time").text().trim()
    
    if (href && title) {
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      const id = href.split("/").pop() || href
      
      news.push({
        url: fullUrl,
        title,
        id: `chinadom-${id}`,
        extra: {
          info: "国内",
          date: timeText ? dayjs(timeText).valueOf() : Date.now(),
        }
      })
    }
  })
  
  return news.slice(0, 20)
})

// 中华国际
const international = defineSource(async () => {
  const baseURL = "https://news.china.com"
  const url = `${baseURL}/international/`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []
  
  const $items = $(".item_list li")
  
  $items.each((_, el) => {
    const $el = $(el)
    const $titleLink = $el.find(".item_title a")
    const href = $titleLink.attr("href") || ""
    const title = $titleLink.text().trim()
    const timeText = $el.find(".item_info .item_time").text().trim()
    
    if (href && title) {
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      const id = href.split("/").pop() || href
      
      news.push({
        url: fullUrl,
        title,
        id: `chainaintl-${id}`,
        extra: {
          info: "国际",
          date: timeText ? dayjs(timeText).valueOf() : Date.now(),
        }
      })
    }
  })
  
  return news.slice(0, 20)
})

// 中华热点 (右侧24小时热点) - 修复版
const hot = defineSource(async () => {
  const baseURL = "https://news.china.com"
  const url = `${baseURL}/`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []
  
  // 尝试多种选择器
  let $items = $("#js-ranktop li")
  
  // 如果没找到，尝试备选选择器
  if ($items.length === 0) {
    $items = $(".rank li, .side_mod .rank li, .hot-list li")
  }
  
  // 如果还没找到，尝试从右侧边栏找
  if ($items.length === 0) {
    $items = $(".side_fixed ul li, .side_mod ul li")
  }
  
  $items.each((index, el) => {
    const $el = $(el)
    const $a = $el.find("a").first()
    const href = $a.attr("href") || ""
    const title = $a.text().trim()
    
    // 过滤掉太短的标题或无效链接
    if (href && title && title.length > 4 && !href.includes("javascript")) {
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      const id = href.split("/").pop() || href
      
      news.push({
        url: fullUrl,
        title,
        id: `chinahot-${id}`,
        extra: {
          info: `热度 ${index + 1}`,
          date: Date.now(),
        }
      })
    }
  })
  
  // 去重
  const uniqueNews = Array.from(
    new Map(news.map(item => [item.url, item])).values()
  )
  
  return uniqueNews.slice(0, 15)
})

// 中华实时 (顶部滚动)
const latest = defineSource(async () => {
  const baseURL = "https://news.china.com"
  const url = `${baseURL}/`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []
  
  const $items = $("#js-latest a")
  
  $items.each((_, el) => {
    const $a = $(el)
    const href = $a.attr("href") || ""
    const title = $a.text().trim()
    
    if (href && title && href !== "#" && title.length > 5) {
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      const id = href.split("/").pop() || href
      
      news.push({
        url: fullUrl,
        title,
        id: `chinalatest-${id}`,
        extra: {
          info: "实时",
          date: Date.now(),
        }
      })
    }
  })
  
  const uniqueNews = Array.from(
    new Map(news.map(item => [item.url, item])).values()
  )
  
  return uniqueNews.slice(0, 15)
})

export default defineSource({
  "chinanews": chinanews,
  "chinanews-hot": hot,
  "chinanews-domestic": domestic,
  "chinanews-international": international,
  "chinanews-latest": latest,
})
