export interface IJwtManagerService {
  encode(payload: any): string;
  verify<T>(token: any): T;
}
