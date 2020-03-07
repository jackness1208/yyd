const yyd = require('../../index')
const { expect } = require('chai')

describe('yyd man', () => {
  it ('usage', async () => {
    expect(await yyd.man({ silent: true })).not.to.equal(null)
  })
})