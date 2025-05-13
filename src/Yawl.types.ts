export type YawlEvent = {
  name: string;
  ean?: string;
  establishment_account_id?: string;
  properties?: Record<string, unknown>;
  user_type?: string;
};

export type YawlView = {
  page: string;
  title?: string;
  properties?: Record<string, unknown>;
};
