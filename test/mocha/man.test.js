const extOs = require('yyl-os')

describe('yyd man', () => {
  it ('usage', async () => {
    await extOs.runCMD('yyd man --silent')
  })
})