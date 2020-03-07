const chalk = require('chalk')

module.exports = function ({ env, config }) {
  let name = '[:repository]:[:tag]'

  if (config.repository && config.tag) {
    name = `${config.repository}:${config.tag}`
  }

  let manPush = []
  const iPrefix = config.pushPrefix ? `${config.pushPrefix}/` : ''
  if (config.pushHost) {
    const remoteTag = `${config.pushHost}${iPrefix ? `/${iPrefix}` : ''}${name}`
    manPush = [
      ` ${chalk.white('# push')}`,
      ` ${chalk.gray('## step 1: login')}`,
      ` ${chalk.yellow.bold(`docker login ${config.pushHost}`)}`,
      ` ${chalk.gray('## step 2: link')}`,
      ` ${chalk.yellow.bold(`docker docker tag ${name} ${remoteTag}`)}`,
      ` ${chalk.gray('## step 3: push')}`,
      ` ${chalk.yellow(`docker push ${remoteTag}`)}`
    ]
  } else {
    manPush = [
      ` ${chalk.white('# push')}`,
      ` ${chalk.gray('## step 1: login')}`,
      ` ${chalk.yellow.bold('docker login')}`,
      ` ${chalk.gray('## step 2: push')}`,
      ` ${chalk.yellow.bold(`docker push  ${iPrefix}${name}`)}`
    ]
  }

  const manBuild = [
    ` ${chalk.white('# build')}`,
    ` ${chalk.yellow.bold(`docker image build ./ -t ${name}`)}`,
    ` ${chalk.yellow.bold(`docker image build ./ -t ${name} --no-cache`)}`
  ]

  const manRun = [
    ` ${chalk.white('# run')}`,
    ` ${chalk.white('## base')}`,
    ` ${chalk.yellow.bold(`docker run -i -t ${name} /bin/bash`)}`,
    ` ${chalk.white('## run with port')}`,
    ` ${chalk.yellow.bold(`docker run -i -t -p [yourPort]:[dockerPort] ${name} /bin/bash`)}`,
    ` ${chalk.white('## run with volume')}`,
    ` ${chalk.yellow.bold(`docker run -i -t -v [:localPath]:[:dockerPath] ${name} /bin/bash`)}`
  ]

  const manExec = [
    ` ${chalk.white('# exec')}`,
    ` ${chalk.yellow.bold('docker exec -i [:imageid] /bin/bash')}`
  ]

  const manRemove = [
    ` ${chalk.white('# remove')}`,
    ` ${chalk.yellow.bold('docker rmi -f [:imageid]')}`
  ]

  const manPull = [
    ` ${chalk.white('# pull')}`,
    ` ${chalk.yellow.bold('docker pull centos:7')}`,
    ` ${chalk.yellow.bold('docker pull registry.docker-cn.com/library/centos:7')}`
  ]


  const manErrors = [
    ` ${chalk.white('# common errors fix')}`,
    ` ${chalk.gray('## --volume not work in windows os')}`,
    ' change c:// => /c/',
    '',
    ` ${chalk.gray('## --volume /d/path/to/project not exists')}`,
    ` ${chalk.gray('### case docker toolbox')}`,
    ` 1.stop docker-machine => ${chalk.yellow.bold('docker-machine stop')}`,
    '',
    ' 2.In VirtualBox, add a Shared Folder: Settings > Shared Folders > Add share - this will be the directory where you want to locate your project, such as D:. Give it an appropriate Folder Name, such as d',
    '',
    ` 3.restart docker-machine => ${chalk.yellow.bold('docker-machine start')}`,
    '',
    ` ${chalk.gray('## -p 80:80 not work in windows os')}`,
    ` run ${chalk.yellow.bold('docker-machine ip')} to get ip, and visit it`,
    '',
    ` ${chalk.gray('## mongodb volume Operation not permitted in windows os')}`,
    ` 1.run ${chalk.yellow.bold('docker volume create --name mongodata')} to create volume data`,
    ` 2.run ${chalk.yellow.bold('docker run -v mongodata:/db xxxxxxxxx')} to inspect it`
  ]


  const logArr = ['']
    .concat(manPull)
    .concat([''])
    .concat(manBuild)
    .concat([''])
    .concat(manRun)
    .concat([''])
    .concat(manExec)
    .concat([''])
    .concat(manPush)
    .concat([''])
    .concat(manRemove)
    .concat([''])
    .concat(manErrors)
    .concat([''])

  if (!env.silent) {
    // eslint-disable-next-line no-console
    console.log(logArr.join('\r\n'))
  }

  return Promise.resolve(logArr)
}