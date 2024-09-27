declare namespace Auth {
  type CurrentUser = {
    id: string;
    company_id: string;
    name: string;
    email: string;
    role: string;
  };
  type Request<T> = {
    user: CurrentUser;
  } & T;

  type TokenPayload = CurrentUser;
}
