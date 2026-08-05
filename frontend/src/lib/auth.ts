import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  iat: number;
  exp: number;
  uid: number;
  role: 'admin' | 'manager' | 'staff';
}

const TOKEN_KEY = 'erp_auth_token';

export const setAuthToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 1 }); // Expires in 1 day
};

export const getAuthToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeAuthToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const getDecodedToken = (): DecodedToken | null => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    return null;
  }
};

export const getUserRole = (): 'admin' | 'manager' | 'staff' | null => {
  const decoded = getDecodedToken();
  return decoded ? decoded.role : null;
};
