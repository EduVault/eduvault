export interface IApp {
  appID: string;
  devID: string;
  name: string;
  description?: string;
  authorizedDomains?: string[];
  persons?: string[];
}
