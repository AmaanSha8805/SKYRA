export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
  };
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface AuthError {
  detail: string | ValidationError[];
}
