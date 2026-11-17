import { contactListSchema, contactSchema } from '../schemas/contact.schema';
import type { Contact, ContactInput, ContactPatch } from '../types';
import { http } from './http';

/** Capa de servicios de contactos de emergencia. Sin React: solo peticiones. */
export const contactsService = {
  list: (signal?: AbortSignal) => http.get<Contact[]>('/contacts', { signal, schema: contactListSchema }),

  create: (input: ContactInput) => http.post<Contact>('/contacts', input, { schema: contactSchema }),

  update: (id: string, patch: ContactPatch) => http.patch<Contact>(`/contacts/${id}`, patch, { schema: contactSchema }),

  remove: (id: string) => http.delete(`/contacts/${id}`),
};
