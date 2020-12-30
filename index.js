const fs = require('fs')
const path = require('path')
const { BlobServiceClient } = require('@azure/storage-blob')
const mime = require('mime-types')

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

class AzureCdnUploadPlugin {
  constructor(options) {
    this.options = options
    this.blobClient = getContainnersClient(options)
  }
  /**
   * 文件上传白名单
   * @param fileName 文件名称
   * @returns {boolean} 是否为白名单路径
   *
   */
  checkFile(fileName) {
    const suffixList = Array.from(new Set(['.png', '.gif', '.jpg', '.js', '.css']))
    return suffixList.some((item) => fileName.includes(item))
  }

  /**
   * upload file to Azure Blob storage
   * @param filepath 本地文件的绝对路径
   * @param fileName 文件名称
   *
   * */

  uploadFileToAzure(filepath, fileName, cdnDir) {
    fs.readFile(`${filepath}`, async (error) => {
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
        const blobName = cdnDir ? `${cdnDir}/${fileName}` : fileName
        const fileType = mime.contentType(fileName)
        const blockBlobClient = this.blobClient.getBlockBlobClient(blobName)
        const uploadBlobResponse = await blockBlobClient.uploadFile(filepath, {
          blobHTTPHeaders: { blobContentType: fileType },
        })
        if (!uploadBlobResponse.requestId) {
          console.log(`-----> ${blobName} upload failed`)
        }
      } catch (e) {
        console.log('[upload Fail] ->', fileName, '[Error Message]:', e.message)
      }
    })
  }
  /**
   *
   * 递归校验文件，获取文件路径
   * @param dir 文件路径
   * @param cdnDir 上传cdn的folder name
   *
   * */
  getFile(dir, cdnDir = '') {
    const fileList = getDirAllFile(dir)
    for (const file of fileList) {
      const filePath = path.resolve(dir, file)
      if (fs.lstatSync(filePath).isDirectory()) {
        this.getFile(filePath, file)
      }
      if (this.checkFile(file)) {
        this.uploadFileToAzure(filePath, file, cdnDir)
      }
    }
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'AzureCdnUploadPlugin',
      (compilation, cb) => {
        const outputOptions = compilation.outputOptions || compilation.options
        const outputPath = path.normalize(
          outputOptions.path || outputOptions.path.output
        )
        this.getFile(outputPath)
        cb()
      }
    )
  }
}

module.exports = AzureCdnUploadPlugin
