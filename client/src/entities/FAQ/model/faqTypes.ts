import { FAQThunkStatus } from '../../../shared/enums/faqThunkTypes';

export interface Faq {
  id: number;
  question: string | null;
  answers: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQState {
  data: Faq[];
  status: FAQThunkStatus;
  error: string | null;
  selectedFAQ: Faq | null;
}
