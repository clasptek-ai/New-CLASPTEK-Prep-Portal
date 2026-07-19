import { Entity } from '@clasptek/kernel';

export class ResourceReference extends Entity<string> {
  constructor(
    id: string,
    public providerType: string = 'learning_resource_domain',
    public providerResourceId?: string,
    public resourceDomain?: string,
    public resourceUri?: string,
    public resourceVersionId?: string,
    public titleSnapshot?: string,
    public mimeTypeSnapshot?: string,
    public checksum?: string,
    public availabilityStatus: string = 'available',
    public isExternal: boolean = false,
    public externalProvider?: string,
    public externalUrl?: string,
    public licenseCode?: string,
    public status: string = 'active'
  ) {
    super(id);
  }
}
