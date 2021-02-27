export interface IApp {
  _id: string;
  appID: string;
  devID: string;
  name: string;
  description?: string;
  authorizedDomains?: string[];
  persons?: string[];
}
