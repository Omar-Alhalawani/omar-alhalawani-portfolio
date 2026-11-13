export const contactFields = ['name', 'email', 'message'] as const;
export type ContactField = typeof contactFields[number];

// Keep provider responses out of rendered copy and accept only our own field names.
export function contactFailure(status: number, payload: unknown): { message: string; fields: ContactField[] } {
  const errors = payload && typeof payload === 'object' && 'errors' in payload ? payload.errors : [];
  const fields = Array.isArray(errors) ? contactFields.filter(field => errors.some(error =>
    error && typeof error === 'object' && 'field' in error && error.field === field
  )) : [];
  if (status === 429) return { message: 'Too many messages were sent. Wait a few minutes, then try again or email me directly.', fields: [] };
  if (status === 413) return { message: 'Your message is too large. Shorten it, then try again.', fields: [] };
  if (status === 400 || status === 422) return {
    message: fields.length ? 'Check the highlighted fields and try again. Your message is still here.' : 'The form service could not accept this message. Check the required fields or email me directly. Your message is still here.', fields,
  };
  return { message: 'Message delivery is currently unavailable. Please try again later or email me directly. Your message is still here.', fields: [] };
}
