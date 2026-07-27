import { MESSAGES } from "../constants/messages";

export const getDuplicateErrorMessage = (err: any): string => {
  if (!err.keyValue) return MESSAGES.USER.DUPLICATE_FIELD || 'Duplicate field value entered';

  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  // Specific mappings for better readability
  const fieldMappings: Record<string, string> = {
    ownerUserId: 'User',
    phone: 'Phone number',
    email: 'Email address',
    slug: 'Slug',
    name: 'Name',
    sku: 'SKU',
  };

  if (field === "ownerUserId") {
    return MESSAGES.WORKSHOP.ALREADY_OWNER || "This user already owns a workshop";
  }

  if (field === "email") {
    return MESSAGES.USER.EMAIL_EXISTS || "Email already exists";
  }

  const readableField =
    fieldMappings[field] || field.charAt(0).toUpperCase() + field.slice(1);

  return `${readableField} '${value}' already exists. Please use another value!`;
};
