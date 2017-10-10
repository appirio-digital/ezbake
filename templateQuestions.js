module.exports = {
  'localPortPostgres': {
    type: 'input',
    name: 'localPortPostgres',
    message: `Please specify the local port on which to expose the Postgres instance from Docker`,
    default: '60000'
  },
  'localPortRedis': {
    type: 'input',
    name: 'localPortRedis',
    message: `Please specify the local port on which to expose the Redis instance from Docker`,
    default: '60001'
  },
  'localPortWebApp': {
    type: 'input',
    name: 'localPortWebApp',
    message: `Please specify the local port on which to expose the Web App from Docker`,
    default: '60002'
  },
  'localPortNodeDebugger': {
    type: 'input',
    name: 'localPortNodeDebugger',
    message: `Please specify the local port on which to expose the Node Debugger from Docker`,
    default: '60003'
  },
  'localPortReactDevServer': {
    type: 'input',
    name: 'localPortReactDevServer',
    message: `Please specify the local port on which to expose the React Dev server from Docker`,
    default: '60004'
  },
  'localPortSwaggerEditor': {
    type: 'input',
    name: 'localPortSwaggerEditor',
    message: `Please specify the local port on which to expose the React Dev server from Docker`,
    default: '60004'
  }
}