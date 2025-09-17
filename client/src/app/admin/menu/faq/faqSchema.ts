import { z } from 'zod';

export const faqSchema = z.object({
  question: z.string().min(5, 'Вопрос должен содержать минимум 5 символов'),
  answers: z.string().min(10, 'Ответ должен содержать минимум 10 символов'),
});

export type FaqSchemaType = z.infer<typeof faqSchema>;