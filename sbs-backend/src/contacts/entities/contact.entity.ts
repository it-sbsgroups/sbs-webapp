export class Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  subject: string;
  message: string;
  responded: boolean;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}