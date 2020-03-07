const extOs = require('yyl-os')
const path = require('path')
const CASE_BASE_PATH = path.join(__dirname, '../case/pushHost/')

describe('yyd build', () => {
  it ('usage', async () => {
    await extOs.runCMD('yyd build --silent', CASE_BASE_PATH)
  })
})