const extOs = require('yyl-os')
const path = require('path')
const CASE_BASE_PATH = path.join(__dirname, '../case/pushHost/')

describe('yyd clean', () => {
  it ('usage', async () => {
    await extOs.runCMD('yyd clean --silent', CASE_BASE_PATH)
  })
})