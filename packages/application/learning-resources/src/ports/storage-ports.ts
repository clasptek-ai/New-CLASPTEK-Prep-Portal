
export interface ObjectStoragePort {
  generateSignedUploadUrl(bucketName: string, objectPath: string, expiresInSeconds: number): Promise<string>;
  generateSignedDownloadUrl(bucketName: string, objectPath: string, expiresInSeconds: number): Promise<string>;
  promote(sourceBucket: string, sourcePath: string, targetBucket: string, targetPath: string): Promise<void>;
  exists(bucketName: string, objectPath: string): Promise<boolean>;
  delete(bucketName: string, objectPath: string): Promise<void>;
}

export interface SignedAccessPort {
  generateExpiringToken(resourceId: string, versionId: string, userId: string, expiresLimitSeconds: number): Promise<string>;
  verifyExpiringToken(token: string): Promise<{ resourceId: string; versionId: string; userId: string }>;
}

export interface MimeInspectionPort {
  detectMimeType(filePath: string): Promise<string>;
}

export interface ChecksumPort {
  calculateSHA256(filePath: string): Promise<string>;
}

export interface SecurityScanPort {
  scanFile(bucketName: string, objectPath: string): Promise<{ isClear: boolean; threats: string[]; scannerName: string }>;
}

export interface StorageQuotaPort {
  hasSufficientQuota(organizationId: string, requestedBytes: number): Promise<boolean>;
  reserveQuota(organizationId: string, uploadSessionId: string, requestedBytes: number): Promise<void>;
  releaseQuota(organizationId: string, uploadSessionId: string): Promise<void>;
  commitQuotaUsage(organizationId: string, bytesDelta: number): Promise<void>;
}
