import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

export class ContactsService {
  static async createContact(data: {
    email?: string;
    tel?: string;
    address?: string;
    whatsapp?: string;
    telegram?: string;
  }) {
    const contact = await prisma.contacts.create({
      data: {
        email: data.email,
        tel: data.tel,
        address: data.address,
        whatsapp: data.whatsapp,
        telegram: data.telegram,
      },
    });
    return contact;
  }
  static async getAllContacts() {
    const contacts = await prisma.contacts.findMany();
    return contacts;
  }

  static async getContactById(id: number) {
    const contact = await prisma.contacts.findUnique({
      where: { id },
    });
    return contact;
  }

  static async updateContact(
    id: number,
    data: {
      email?: string;
      tel?: string;
      address?: string;
      whatsapp?: string;
      telegram?: string;
    },
  ) {
    const contact = await prisma.contacts.update({
      where: { id },
      data: {
        email: data.email,
        tel: data.tel,
        address: data.address,
        whatsapp: data.whatsapp,
        telegram: data.telegram,
      },
    });
    return contact;
  }

  static async deleteContact(id: number) {
    const contact = await prisma.contacts.delete({
      where: { id },
    });
    return contact;
  }
}
