import { AggregateRoot } from '@clasptek/kernel';

export interface MediaUsageReference {
  resourceType: 'QUESTION' | 'PASSAGE' | 'ASSESSMENT' | 'PRACTICE' | 'MOCK';
  resourceId: string;
  boundAt: Date;
}

export class MediaAsset extends AggregateRoot<string> {
  private _usageReferences: MediaUsageReference[] = [];
  private _versions: Array<{
    versionNo: number;
    objectKey: string;
    fileSize: number;
    checksum: string;
    uploadedAt: Date;
  }> = [];

  constructor(
    id: string,
    public readonly code: string,
    public title: string,
    public mimeType: string,
    public objectKey: string,
    public bucket: string,
    public fileSize: number,
    public checksum: string,
    public status: 'PENDING' | 'READY' | 'PUBLISHED' | 'ARCHIVED' = 'READY',
    public versionNo: number = 1,
    public readonly tenantId: string = '00000000-0000-0000-0000-000000000000',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public lockVersion: number = 0
  ) {
    super(id);
    this._versions.push({
      versionNo: 1,
      objectKey,
      fileSize,
      checksum,
      uploadedAt: new Date(),
    });
  }

  public get usageReferences(): readonly MediaUsageReference[] {
    return this._usageReferences;
  }

  public get usageCount(): number {
    return this._usageReferences.length;
  }

  public get versions(): ReadonlyArray<{
    versionNo: number;
    objectKey: string;
    fileSize: number;
    checksum: string;
    uploadedAt: Date;
  }> {
    return this._versions;
  }

  public static create(
    id: string,
    code: string,
    title: string,
    mimeType: string,
    objectKey: string,
    bucket: string,
    fileSize: number,
    checksum: string,
    tenantId?: string
  ): MediaAsset {
    return new MediaAsset(
      id,
      code,
      title,
      mimeType,
      objectKey,
      bucket,
      fileSize,
      checksum,
      'READY',
      1,
      tenantId
    );
  }

  public uploadNewVersion(objectKey: string, fileSize: number, checksum: string): void {
    const nextVer = this.versionNo + 1;
    this.versionNo = nextVer;
    this.objectKey = objectKey;
    this.fileSize = fileSize;
    this.checksum = checksum;
    this.updatedAt = new Date();

    this._versions.push({
      versionNo: nextVer,
      objectKey,
      fileSize,
      checksum,
      uploadedAt: new Date(),
    });
  }

  public bindUsage(
    resourceType: 'QUESTION' | 'PASSAGE' | 'ASSESSMENT' | 'PRACTICE' | 'MOCK',
    resourceId: string
  ): void {
    if (
      !this._usageReferences.some(
        (u) => u.resourceType === resourceType && u.resourceId === resourceId
      )
    ) {
      this._usageReferences.push({
        resourceType,
        resourceId,
        boundAt: new Date(),
      });
      this.updatedAt = new Date();
    }
  }

  public unbindUsage(
    resourceType: 'QUESTION' | 'PASSAGE' | 'ASSESSMENT' | 'PRACTICE' | 'MOCK',
    resourceId: string
  ): void {
    this._usageReferences = this._usageReferences.filter(
      (u) => !(u.resourceType === resourceType && u.resourceId === resourceId)
    );
    this.updatedAt = new Date();
  }

  public publish(): void {
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  public archive(): void {
    if (this._usageReferences.length > 0) {
      throw new Error(
        `Cannot archive MediaAsset '${this.id}' while it is referenced by ${this._usageReferences.length} resource(s).`
      );
    }
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }
}
