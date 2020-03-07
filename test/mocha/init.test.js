const path = require('path')
const fs = require('fs')
const { expect } = require('chai')
const extFs = require('yyl-fs')
const extOs = require('yyl-os')
const FRAG_PATH = path.join(__dirname, '../__frag')

describe('yyd init', () => {
  const pjPath = path.join(FRAG_PATH, 'yyd-helloworld')
  beforeEach(async () => {
    await extFs.mkdirSync(pjPath)
    await extFs.removeFiles(pjPath)
  })
  it ('usage', async () => {
    await extOs.runCMD('yyd init', pjPath)
    expect(fs.readdirSync(pjPath).length).not.to.equal(0)
  })

  afterEach(async () => {
    await extFs.removeFiles(pjPath)
  })
})