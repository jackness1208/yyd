const extOs = require('yyl-os')
const path = require('path')
const CASE_BASE_PATH = path.join(__dirname, '../case/pushHost/')

describe('yyd stop', () => {
  it ('usage', async () => {
    await extOs.runCMD('yyd stop --silent', CASE_BASE_PATH)
  })
})