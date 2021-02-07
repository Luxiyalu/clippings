import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'

export default function processClippings(content) {
  const clippings = content.split(/==========/)

  /** 转换成这个格式：{ title, location, time, paragraph } 的array */
  const processedClippings = clippings
    .map((clipping) => {
      const [title, locationStr, ...paragraphs] = clipping
        .split(/\r?\n/)
        .filter((s) => s.length > 0)

      const locations = locationStr?.match(/(\d.)-(\d.)/)
      const location = locations && parseInt(locations[1], 10)
      const time = new Date(locationStr?.split(',')[1].trim()).getTime()
      const paragraph = paragraphs?.filter((s) => s.length > 1)[0]?.trim()

      return { title, location, time, paragraph }
    })
    .filter((clipping) => clipping.title)

  /** 把多余的信息去掉，只留下排列好顺序的clipping内容，先按照location排序，同样的话看timestamp */
  const books = {}
  const booksGrouped = groupBy(processedClippings, (c) => c?.title?.trim())
  Object.keys(booksGrouped).forEach((bookTitle) => {
    const bookObjArr = booksGrouped[bookTitle]
    const paragraphs = sortBy(bookObjArr, ['location', 'time'])

    books[bookTitle] = map(paragraphs, 'paragraph')
  })

  return books
}
