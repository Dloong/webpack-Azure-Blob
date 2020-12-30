# Azure CDN Upload Plugin

This is a webpack plugin that allows you upload static resource to an Azure storage account. This uses the [@azure/storage-blob](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs) plugin to authenticate and upload to Azure.

## Installation

Install the plugin with npm:

```
npm install AzureCdnUploadPlugin --save-dev
```

or

```
yarn add AzureCdnUploadPlugin
```

## Basic Usage

```javascript
const path = require('path')
const AzureCdnUploadPlugin = require('./plugin/AzureCdnUploadPlugin.js')

module.exports = {
  entry: {
    main: './src/main.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name]_[hash:8].js',
  },
  plugins: [
    new AzureCdnUploadPlugin({
      connection: {
        connectionString: process.env.CONNECTION_STRING,
      },
      accountName: process.env.ACCOUNTNAME,
      containerName: process.env.CONTAINNERNAME
    }),
  ],
}
```

### Configuration

The plugin allowed values are as follows:

- connectionString: your Azure account connection string
- accountName: Azure account name
- containerName: Azure container name

## Notice:

if you upload static resource successfuly. you need to rewrite the public path.

Eg: You want to replace the local image address with the network address.

```javascript
module: {
    rules: [
      {
        test: /.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name]_[hash:8].[ext]',
              publicPath: 'https://your Azure address/account name/',
            },
          },
        ],
      },
    ],
  }
```

### To be continued...
