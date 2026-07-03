export class ContactResponse {
  id: string;
  contactId: string;
  emailBody: string;
  sentAt: Date;
  sentFrom: string;
  subject: string | null;
  receivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}