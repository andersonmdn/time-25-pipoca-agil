const path = require('path')
const { getDefaultConfig } = require('@expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Permite resolver pacotes de fora (monorepo)
config.watchFolders = [workspaceRoot]

// Resolve @core/@ui do monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Transpila código TS do monorepo
config.resolver.sourceExts.push('cjs')

module.exports = config
