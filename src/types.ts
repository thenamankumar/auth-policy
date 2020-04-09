export interface IAuthorizerData {
  viewer: any;
  action: string;
  entity: any;
  value?: any;
}

export interface IAuthorizer {
  (data: IAuthorizerData): boolean;
}

export interface IConcerns {
  [name: string]: IAuthorizer;
}
