import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

export class FAQService {
  static async createFAQ(data: {
    question?: string;
    answers?: string;
  }) {
    try {
      const faq = await prisma.faq.create({
        data: {
          question: data.question ?? null,
          answers: data.answers ?? null,
        },
      });
      return {
        id: faq.id,
        question: faq.question,
        answers: faq.answers,
        createdAt: faq.createdAt.toISOString(),
        updatedAt: faq.updatedAt.toISOString()
      };
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  }

  static async getAllFAQs() {
    try {
      const faqs = await prisma.faq.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return faqs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answers: faq.answers,
        createdAt: faq.createdAt.toISOString(),
        updatedAt: faq.updatedAt.toISOString()
      }));
    } catch (error) {
      console.error('Error getting FAQs:', error);
      throw error;
    }
  }

  static async getFAQById(id: number) {
    try {
      const faq = await prisma.faq.findUnique({
        where: { id },
      });
      if (!faq) return null;
      
      return {
        id: faq.id,
        question: faq.question,
        answers: faq.answers,
        createdAt: faq.createdAt.toISOString(),
        updatedAt: faq.updatedAt.toISOString()
      };
    } catch (error) {
      console.error('Error getting FAQ by id:', error);
      throw error;
    }
  }

  static async updateFAQ(
    id: number,
    data: {
      question?: string;
      answers?: string;
    },
  ) {
    try {
      const faq = await prisma.faq.update({
        where: { id },
        data: {
          question: data.question ?? undefined,
          answers: data.answers ?? undefined,
        },
      });
      return {
        id: faq.id,
        question: faq.question,
        answers: faq.answers,
        createdAt: faq.createdAt.toISOString(),
        updatedAt: faq.updatedAt.toISOString()
      };
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  }

  static async deleteFAQ(id: number) {
    try {
      const faq = await prisma.faq.delete({
        where: { id },
      });
      return {
        id: faq.id,
        question: faq.question,
        answers: faq.answers,
        createdAt: faq.createdAt.toISOString(),
        updatedAt: faq.updatedAt.toISOString()
      };
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  }
}