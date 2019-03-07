const yyd = require('../index.js');
const tUtil = require('yyl-seed-test-util');
const path = require('path');
const pkg = require('../package.json');

jest.setTimeout(30000);

const FRAG_PATH = path.join(__dirname, './__frag');

const TEST_CTRL = {
  VERSION: true,
  PATH: true,
  MAN: true,
  INIT: true,
  BUILD: true,
  RELEASE: true,
  START: true
};

tUtil.frag.init(FRAG_PATH);

if (TEST_CTRL.VERSION) {
  it ('yyd --version', async () => {
    const r = await yyd.run('--version --silent');
    expect(r).toEqual(pkg.version);
  });

  it ('yyd -v', async () => {
    const r = await yyd.run('-v --silent');
    expect(r).toEqual(pkg.version);
  });
}

if (TEST_CTRL.PATH) {
  it ('yyd --path', async () => {
    const r = await yyd.run('--path --silent');
    expect(r).toEqual(pkg.version);
  });
}
