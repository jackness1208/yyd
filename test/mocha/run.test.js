const extOs = require('yyl-os')
const path = require('path')
const CASE_BASE_PATH = path.join(__dirname, '../case/pushHost/')

describe('yyd run', () => {
  it ('usage', async () => {
    await extOs.runCMD('yyd run --silent', CASE_BASE_PATH)
  })
})