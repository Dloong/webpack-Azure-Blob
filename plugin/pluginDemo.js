const fs = require('fs')
const path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob')

/**
 * Des: Connect client or create a client to get container
 * Auth: Along
 *
 * */
function getContainnersClient(options) {
  const storageServerContainer = BlobServiceClient.fromConnectionString(
    options.connection.connectionString
  )
  return storageServerContainer.getContainerClient(options.containerName)
}

/**
 * Des: read fileName
 */
function getDirAllFile(dirPath) {
  return fs.readdirSync(dirPath)
}
/**
 * 文件上传白名单
 * @param fileName 文件名称
 * @returns {boolean} 是否为白名单路径
 */
function checkFile(fileName) {
  const suffixList = Array.from(new Set(['.png', '.gif', '.jpg']))
  return suffixList.some((item) => fileName.includes(item))
}

class AzurePlugin {
  constructor(options) {
    this.options = options
    this.blobClient = getContainnersClient(options)
  }
  getFile(dir, cdnFileDir = '') {
    const fileList = getDirAllFile(dir)
    for (const file of fileList) {
      const filePath = path.resolve(dir, file)
      if (fs.lstatSync(filePath).isDirectory()) {
        getFile(filePath, file)
      }
      if (checkFile(file)) {
        this.putFileToAzure(
          filePath,
          file,
          cdnFileDir === '' ? '' : `/${cdnFileDir}`
        )
      }
    }
  }

  putFileToAzure(filepath, fileName, cdnFileDir = '') {
    fs.readFile(`${filepath}`, async (error, fileContent) => {
      if (error) {
        console.log(
          '[File Error] ->',
          fileName,
          '[Error Message]:',
          err.message
        )
        return
      }
      try {
        const filePathInCDN = `${
          this.options.prefix || ''
        }${cdnFileDir}/${fileName}`
        const blockBlobClient = this.blobClient.getBlockBlobClient(fileName)
        const uploadBlobResponse = await blockBlobClient.upload(
          fileName,
          fileName.length
        )
        console.log(uploadBlobResponse.requestId)
        this.getContainerBlobList()
      } catch (e) {
        console.log('[upload Fail] ->', fileName, '[Error Message]:', e.message)
      }
    })
  }
  getFile(dir, cdnFileDir = '') {
    const fileList = getDirAllFile(dir)
    for (const file of fileList) {
      const filePath = path.resolve(dir, file)
      if (fs.lstatSync(filePath).isDirectory()) {
        this.getFile(filePath, file)
      }
      if (checkFile(file)) {
        this.putFileToAzure(
          filePath,
          file,
          cdnFileDir === '' ? '' : `/${cdnFileDir}`
        )
      }
    }
  }
  async getContainerBlobList() {
    try {
      for await (const blob of this.blobClient.listBlobsFlat()) {
        console.log('\t', blob.name)
      }
    } catch (e) {
      console.log(e)
    }
  }
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      {
        name: 'CdnUploadPlugin',
        context: true,
      },
      () => {
        this.getFile(this.options.dir)
      }
    )
  }
}

module.exports = AzurePlugin
