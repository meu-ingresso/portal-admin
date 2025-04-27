import { UserWithRelations } from "../users";

export interface UserAttachmentPayload {
  id?: string;
  user_id: string;
  name: string;
  type: string;
  value: string;
  created_at?: string;
  deleted_at?: string;
}

export interface UserAttachmentWithRelations extends UserAttachmentPayload {
  user: UserWithRelations;
}
