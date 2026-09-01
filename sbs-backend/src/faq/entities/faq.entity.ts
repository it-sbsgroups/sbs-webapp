export class FaqEntity {
  id: string;
  name: string | null;
  email: string | null;

  question: string;
  answer: string | null;

  isApproved: boolean;
  isListedOnFaqPage: boolean;
  isFeaturedInComponent: boolean;
  isAdminCreated: boolean;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}