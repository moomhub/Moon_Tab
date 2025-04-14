// S3 请求解决枚举
export enum S3ResultEnum {
  SAVE_FILE_FAILURE = '保存文件失败',
  FILE_CONTENT_FAILURE = '获取文件内容失败',
  FILE_NOT_FOUND = '文件不存在',
  FILELIST_FAILURE = '文件列表获取失败',
  DELETE_FILE_FAILURE = '文件删除失败',
  CONNECTION_SUCCESS = 'S3测试连接成功',
  CONNECTION_FAILURE = 'S3测试连接失败',
  CONNECTION_FAILURE_BUCKET = 'Bucket配置错误',
  CONNECTION_FAILURE_AUTH = 'S3认证失败',
  CONFIG_ERROR = 'S3配置错误',
}

// S3链接配置
export interface S3Config {
  endpoint: string; // S3服务的端点
  region: string; // 区域
  accessKeyId: string; // 访问密钥ID
  secretAccessKey: string; // 访问密钥
  bucket: string; // 存储桶名称
  folder?: string; // 可选的文件夹路径，默认为空字符串
}

// S3测试链接返回结果
export interface S3TestResult {
  success: boolean;
  message: string;
}

// S3文件列表返回结果
export interface S3FileList {
  success: boolean; // 是否成功
  files: S3File[]; // 文件列表
}

// S3文件信息
export interface S3File {
  Key: string; // 文件名称
  LastModified?: Date; // 最后修改时间
  Size?: number; // 文件大小（字节）
  ETag?: string; // 文件的ETag
}
