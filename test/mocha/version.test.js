const yyd = require('../../index')
const { expect } = require('chai')

describe('yyd version', () => {
  it ('usage', async () => {
    expect(await yyd.version({ env: {silent: true} })).not.to.equal(null)
  })
})