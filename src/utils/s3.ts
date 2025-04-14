import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  type _Object,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
  MetadataBearer as __MetadataBearer,
  StreamingBlobPayloadInputTypes,
} from '@smithy/types';

import { S3Config, S3File, S3ResultEnum } from '@/types/s3';

// 默认的S3文件夹
const defaultFolder = import.meta.env.VITE_S3_BACKUP_FOLDER ||  '/applications/moon-tab/backups';

export class S3Service {
  private s3Client: S3Client | null = null;
  private config: S3Config;

  constructor(config: S3Config) {
    this.config = config;
    this.init();
  }

  /**
   * Description 初始化S3客户端
   * @returns {any}
   */
  private init() {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        endpoint: this.config.endpoint,
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });
    }
  }

  /**
   * Description 保存文件到S3
   * @param {string} fileName 文件名称
   * @param {StreamingBlobPayloadInputTypes} content? 文件内容
   * @returns {any}
   */
  public async saveFile(
    fileName: string,
    content?: StreamingBlobPayloadInputTypes
  ) {
    try {
      const folder = this.config.folder || defaultFolder;
      const key = `${folder}/${fileName}`;
      await this.s3Client!.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: content,
        })
      );
    } catch (error) {
      throw new Error(S3ResultEnum.SAVE_FILE_FAILURE);
    }
  }

  /**
   * Description 从S3获取文件内容
   * @param {string} key /文件路径/文件名称
   * @returns {any}
   */
  public async getFileContent(key: string): Promise<string> {
    try {
      const response = await this.s3Client!.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        })
      );
      return response.Body!.transformToString();
    } catch (error) {
      throw new Error(S3ResultEnum.FILELIST_FAILURE);
    }
  }

  /**
   * Description 从S3获取文件内容
   * @param {string} key /文件路径/文件名称
   * @returns {any}
   */
  public async getFile(key: string): Promise<Uint8Array> {
    try {
      const response = await this.s3Client!.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        })
      );
      return response.Body!.transformToByteArray();
    } catch (error) {
      throw new Error(S3ResultEnum.FILELIST_FAILURE);
    }
  }

  /**
   * Description 从S3获取文件列表
   * @returns {any}
   */
  public async getFileList(): Promise<S3File[]> {
    try {
      // 使用folder配置或默认文件夹
      const folder = this.config.folder || defaultFolder;
      const response = await this.s3Client!.send(
        new ListObjectsV2Command({
          Bucket: this.config.bucket,
          Prefix: folder,
          MaxKeys: 100, // 限制最大返回数量
        })
      );
      return (response.Contents || []).map((item: _Object) => ({
        Key: item.Key!,
        LastModified: item.LastModified,
        Size: item.Size,
        ETag: item.ETag,
      }));
    } catch (error) {
      throw new Error(S3ResultEnum.FILE_CONTENT_FAILURE);
    }
  }

  /**
   * Description 从S3删除文件
   * @param {string} key /文件路径/文件名称
   * @returns {any}
   */
  public async deleteFile(key: string) {
    try {
      await this.s3Client!.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        })
      );
    } catch (error) {
      throw new Error(S3ResultEnum.DELETE_FILE_FAILURE);
    }
  }

  /**
   * Description 检查S3连接
   * @returns {any}
   */
  public async checkConnection() {
    try {
      // 先检查test文件是否存在
      const fileName = 'test';
      await this.saveFile(fileName, new Uint8Array());
    } catch (error) {
      console.error('check s3 connection error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error(S3ResultEnum.CONNECTION_FAILURE);
        }
        if (error.message.includes('The specified bucket does not exist')) {
          throw new Error(S3ResultEnum.CONNECTION_FAILURE_BUCKET);
        }
        if (
          error.message.includes(
            'The Access Key Id you provided does not exist in our records'
          ) ||
          error.message.includes(
            'The request signature we calculated does not match the signature you provided. Check your key and signing method'
          )
        ) {
          throw new Error(S3ResultEnum.CONNECTION_FAILURE_AUTH);
        }
      }
      throw new Error(S3ResultEnum.CONNECTION_FAILURE);
    }
  }
}
export default S3Service;
