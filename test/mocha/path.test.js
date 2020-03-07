const yyd = require('../../index')
const { expect } = require('chai')

describe('yyd path', () => {
  it ('usage', async () => {
    expect(await yyd.path({ silent: true })).not.to.equal(null)
  })
})