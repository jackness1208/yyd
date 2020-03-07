const extOs = require('yyl-os')
const path = require('path')
const CASE_BASE_PATH = path.join(__dirname, '../case/pushHost/')

describe('yyd push', () => {
  it ('usage', async () => {
    await extOs.runCMD('yyd push --silent', CASE_BASE_PATH)
  })
})