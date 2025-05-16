export type YawlEvent = {
  name: string;
  ean?: string;
  establishment_account_id?: string;
  properties?: Record<string, unknown>;
  user_type?: string;
};

/**
 * YawlView is a type that represents a view tracking event.
 * It contains optional properties for page, title, and additional properties.
 *
 * @param page - Optional path of the page being viewed. ie. "/home". Ignored if viewTracker is set.
 * @param title - Optional title of the page being viewed. ie. "Home". Ignored if viewTracker is set.
 * @param properties - Optional additional properties to be sent with the event. Merged with viewTracker's properties.
 */
export type YawlView = {
  page?: string;
  title?: string;
  properties?: Record<string, unknown>;
};
