import wretch from "wretch";

export type Env = "prod" | "staging";
export const API_URL: { [key in Env]: string } = {
  prod: "https://www.edulib.fr",
  staging: "https://staging.edulib.fr",
} as const;

export type YawlApi = {
  sendVisit: (data: object) => Promise<any>;
  sendEvent: (data: object) => Promise<any>;
};

export const yawlApi = ({
  apiKey,
  env = "prod",
}: {
  apiKey: string;
  env?: Env;
}): YawlApi => {
  async function fetchGuard(url: string, data: object) {
    return await wretch(url).headers({ "Api-Key": apiKey }).post(data).json();
  }
  async function sendVisit(data: object) {
    return fetchGuard(`${API_URL[env]}/ahoy/visits`, data);
  }

  async function sendEvent(data: object) {
    return fetchGuard(`${API_URL[env]}/ahoy/events`, data);
  }
  return { sendVisit, sendEvent };
};
