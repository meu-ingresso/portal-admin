import { PeopleWithRelations } from '../people';
import { RolePayload } from '../roles';
import { UserAttachmentWithRelations } from '../user-attachments';
export interface UserPayload {
  id?: string;
  people_id: string;
  email: string;
  alias: string;
  role_id: string;
  account_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface UserWithRelations extends UserPayload {
  people: PeopleWithRelations;
  role: RolePayload;
  attachments: UserAttachmentWithRelations[];
}