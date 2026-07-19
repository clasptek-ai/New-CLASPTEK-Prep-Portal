import { NextRequest, NextResponse } from 'next/server';
import { getLearningResourceContext } from '@/lib/learning-resource-context';

export async function GET(
  req: NextRequest,
  _params: { params: Promise<{ id: string }> }
) {
  const { getResourceHandler } = await getLearningResourceContext();
  const { id } = await _params.params;

  const resource = await getResourceHandler.execute(id);
  if (!resource) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Resource not found' }, { status: 404 });
  }

  // Format resource details, versions, transcripts, media, and attachments for JSON delivery
  return NextResponse.json({
    id: resource.id,
    lessonId: resource.lessonId,
    code: resource.code.value,
    resourceType: resource.resourceType,
    slug: resource.slug,
    name: resource.name,
    description: resource.description,
    displayOrder: resource.displayOrder,
    status: resource.status,
    versions: resource.versions.map(v => ({
      id: v.id,
      versionNo: v.versionNo.value,
      status: v.status,
      name: v.name,
      description: v.description,
      mediaAsset: v.mediaAsset ? {
        id: v.mediaAsset.id,
        provider: v.mediaAsset.provider,
        bucket: v.mediaAsset.bucket,
        objectKey: v.mediaAsset.objectKey,
        region: v.mediaAsset.region,
        checksum: v.mediaAsset.checksum,
        mimeType: v.mediaAsset.mimeType,
        size: v.mediaAsset.size,
        duration: v.mediaAsset.duration
      } : null,
      attachments: v.attachments.map(a => ({
        id: a.id,
        name: a.name,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        objectKey: a.objectKey
      })),
      downloads: v.downloads.map(d => ({
        id: d.id,
        url: d.url,
        title: d.title
      })),
      externalLinks: v.externalLinks.map(l => ({
        id: l.id,
        url: l.url,
        title: l.title
      })),
      transcripts: v.transcripts.map(t => ({
        id: t.id,
        transcriptText: t.transcriptText,
        language: t.language
      })),
      captions: v.captions.map(c => ({
        id: c.id,
        captionText: c.captionText,
        language: c.language
      })),
      metadata: Object.fromEntries(v.metadata.entries())
    }))
  });
}
