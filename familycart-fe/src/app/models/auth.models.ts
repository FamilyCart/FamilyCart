export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message?: string;
  email?: string;
}

export interface OTPRequest {
  email: string;
  otp: string;
}

export interface User {
  id: number;
  uuid: string;
  gender: string | null;
  email: string;
  is_admin: boolean;
  username: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
}

export interface OTPResponsePayload {
  token: string;
  user: User;
}

export interface OTPResponse {
  message?: string;
  payload?: OTPResponsePayload;
  status?: number;
}

export interface SignupRequest {
  email: string;
  first_name: string;
  last_name: string;
}

export interface SignupResponsePayload {
  token?: string;
  user?: User;
}

export interface SignupResponse {
  message?: string;
  payload?: SignupResponsePayload;
  status?: number;
}

export interface JoinFamilyRequest {
  family_code: string;
}

export interface CreateFamilyRequest {
  family_name: string;
}

export interface FamilyResponse {
  message?: string;
  id?: number;
  name?: string;
  code?: string;
}

