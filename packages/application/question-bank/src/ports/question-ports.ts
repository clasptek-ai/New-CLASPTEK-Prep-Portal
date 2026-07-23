export interface SignedUrlResolverPort {
  resolveSignedUrl(storageAssetId: string): Promise<string>;
}
