const extOs = require('yyl-os')
const path = require('path')
const CASE_BASE_PATH = path.join(__dirname, '../case/pushHost/')

describe('yyd push', () => {
  it ('usage', async () => {
    await extOs.runCMD('yyd push --silent', CASE_BASE_PATH)
    await extOs.runCMD('yyd push --silent --username liudaojie --password Asdf1234', CASE_BASE_PATH)
  })
})