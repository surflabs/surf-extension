module.exports = {
  productionSourceMap: false,
  chainWebpack: config => {
    config.optimization.delete('splitChunks')
    config.module
      .rule('compile')
      .test(/node_modules+(\\|\/)+(@mysten|@wallet-standard)/)
      .use('babel')
      .loader('babel-loader')
      .options({
        presets: [
          '@vue/cli-plugin-babel/preset'
        ]
      })
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            blue: '#6E66FA',
            red: '#FF7171'
          }
        }
      }
    }
  },
  pages: {
    popup: {
      template: 'public/popup-template.html',
      entry: './src/popup/main.js',
      title: 'Surf Wallet'
    },
    standalone: {
      template: 'public/sign.html',
      entry: './src/standalone/main.js',
      title: 'Surf Wallet',
      filename: 'index.html'
    },
    onlineblocked: {
      template: 'public/browser-extension.html',
      entry: './src/onlineblocked/main.js',
      title: 'Surf Wallet',
      filename: 'online-blocked.html'
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.js'
            ],
            'inpage-script': [
              'src/content-scripts/inpage-script.js'
            ]
          }
        }
      }
    }
  }
}
