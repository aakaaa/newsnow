import type { NewsItem } from "@shared/types"
import { load } from "cheerio"
import dayjs from "dayjs/esm"

// 快讯列表 - 修复版
const quick = defineSource(async () => {
  const baseURL = "https://www.36kr.com"
  const url = `${baseURL}/newsflashes`
  const response = await myFetch(url) as any
  const $ = load(response)
  const news: NewsItem[] = []
  
  // 新的选择器：每个快讯项对应 .flow-item
  const $items = $(".flow-item")
  
  $items.each((_, el) => {
    const $el = $(el)
    
    // 标题和链接 - 在 .newsflash-item .item-title 中
    const $newsflashItem = $el.find(".newsflash-item")
    const $a = $newsflashItem.find("a.item-title")
    const href = $a.attr("href") || ""
    const title = $a.text().trim()
    
    // 时间 - 在 .item-related .time 中
    const timeElement = $el.find(".item-related .time").text()
    
    // 描述/内容 - 在 .item-desc 中
    const description = $el.find(".item-desc span").text().trim()
    
    if (href && title) {
      // 构建完整URL（如果是相对路径）
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      
      // 从href中提取ID作为唯一标识
      const id = href.split("/").pop() || href
      
      const newsItem: NewsItem = {
        url: fullUrl,
        title,
        id,
      }
      
      // 如果有时间，添加到extra
      if (timeElement) {
        try {
          // 解析相对时间（如"51秒前"）
          newsItem.extra = {
            date: parseRelativeDate(timeElement, "Asia/Shanghai").valueOf(),
          }
        } catch (e) {
          // 如果解析失败，使用当前时间
          newsItem.extra = {
            date: Date.now(),
          }
        }
      }
      
      // 如果有描述，添加到extra
      if (description) {
        newsItem.extra = {
          ...newsItem.extra,
          hover: description,
        }
      }
      
      news.push(newsItem)
    }
  })

  return news
})

// 24小时热榜 - 从右侧边栏获取
const hotlist = defineSource(async () => {
  const baseURL = "https://www.36kr.com"
  const url = `${baseURL}/newsflashes`
  const response = await myFetch(url) as any
  const $ = load(response)
  const articles: NewsItem[] = []

  // 热榜在右侧 .kr-hotlist 中
  const $hotlist = $(".kr-hotlist")
  
  // 选择前两个带大图的特殊项
  const $topItems = $hotlist.find(".hotlist-item-toptwo")
  $topItems.each((_, el) => {
    const $el = $(el)
    
    // 标题和链接
    const $a = $el.find("a.hotlist-item-toptwo-title")
    const href = $a.attr("href") || ""
    const title = $a.find("p").text().trim()
    
    // 图片
    const $img = $el.find("img")
    const imgSrc = $img.attr("src") || ""
    
    if (href && title) {
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      const id = href.split("/").pop() || href
      
      articles.push({
        url: fullUrl,
        title,
        id,
        extra: {
          info: "🔥 热门",
          hover: imgSrc,
        },
      })
    }
  })
  
  // 选择其他列表项
  const $otherItems = $hotlist.find(".hotlist-item-other")
  $otherItems.each((_, el) => {
    const $el = $(el)
    
    // 标题和链接
    const $a = $el.find("a.hotlist-item-other-title")
    const href = $a.attr("href") || ""
    const title = $a.text().trim()
    
    // 发布时间
    const timeText = $el.find(".hotlist-item-other-time").text()
    
    // 图片
    const $img = $el.find("img")
    const imgSrc = $img.attr("src") || ""
    
    if (href && title) {
      const fullUrl = href.startsWith("http") ? href : `${baseURL}${href}`
      const id = href.split("/").pop() || href
      
      articles.push({
        url: fullUrl,
        title,
        id,
        extra: {
          info: timeText,
          hover: imgSrc,
        },
      })
    }
  })
  
  return articles.slice(0, 10) // 最多返回10条
})

// 导出源
export default defineSource({
  "36kr": quick,
  "36kr-quick": quick,
  "36kr-renqi": hotlist, // 将人气榜改为热榜
})
