const fs = require('fs')
const util = require('yyl-util')
const { HISTORY_PATH } = require('./const')


const HISTORY_TITLE_TMPL = '## {$tag} ({$date})'

const HISTORY_ITEM_TMPL = '* 同步 `{$repository}@{$tag}` 版本'
const HISTORY_TMPL = [
  '# 版本信息',
  '由构建工具生成，请勿更改',
  '{$list}'
].join('\r\n')


const REG = {
  MD_H2: /^#{2}\s+([^\s].*$)/,
  MD_LIST: /^\*\s+([^\s].*$)/,
  MD_TL_VER: /^([^\s]+)\s*\(.+$/,
  MD_TL_DATE: /.+\(([^)]+)\)$/
}

module.exports.history = {
  source: null,
  init() {
    const self = this
    if (!fs.existsSync(HISTORY_PATH)) {
      fs.writeFileSync(HISTORY_PATH, HISTORY_TMPL.replace('{$list}', ''))
      print.log.warn('history.md not exists, build it')
      print.log.add(HISTORY_PATH)
    }

    const cnt = fs.readFileSync(HISTORY_PATH).toString()
    const cntArr = cnt.split(/[\r\n]+/)
    const r = {}
    let curPoint = null
    cntArr.forEach((str) => {
      if (str.match(REG.MD_H2)) {
        const title = str.replace(REG.MD_H2, '$1')
        const obj = {
          title,
          date: new Date(title.replace(REG.MD_TL_DATE, '$1')),
          tag: title.replace(REG.MD_TL_VER, '$1'),
          content: []
        }

        r[obj.tag] = obj
        curPoint = obj
      } else if (str.match(REG.MD_LIST) && curPoint) {
        curPoint.content.push(str)
      }
    })

    self.source = r
    return r
  },
  get() {
    const self = this
    if (!self.source) {
      self.init()
    }
    return Object.keys(self.source).sort((a, b) => {
      return -util.compareVersion(a, b)
    })
  },
  add({ tag, config }) {
    const self = this
    if (!self.source) {
      self.init()
    }

    const now = new Date()
    self.source[tag] = {
      title: HISTORY_TITLE_TMPL.replace('{$tag}', tag).replace('{$date}', print.fn.dateFormat(now)),
      date: now,
      tag: tag,
      content: [HISTORY_ITEM_TMPL.replace('{$tag}', tag).replace('{$repository}', config.repository)]
    }

    self.save()
  },
  save({ config }) {
    const self = this
    const vers = self.get()

    const r = HISTORY_TMPL.replace('{$list}', (() => {
      const arr = []
      vers.forEach((ver) => {
        const item = self.source[ver]
        if (item) {
          arr.push(HISTORY_TITLE_TMPL.replace('{$tag}', item.tag).replace('{$date}', print.fn.dateFormat(item.date)))
          arr.push(HISTORY_ITEM_TMPL.replace('{$tag}', item.tag).replace('{$repository}', config.repository))
        }
      })
      return arr.join('\r\n')
    })())

    fs.writeFileSync(HISTORY_PATH, r)
    print.log.success('history.md updated')
  }
}