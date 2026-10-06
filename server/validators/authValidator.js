import ApiError from '../utils/ApiError.js';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RX = /^[0-9+\-\s]{7,15}$/;
const str = (v) => (typeof v === 'string' ? v.trim() : '');

export const checkEmail = (value) => {
  const email = str(value).toLowerCase();
  if (!EMAIL_RX.test(email) || email.length > 120) throw new ApiError(400, 'Please enter a valid email address');
  return email;
};

// bcrypt only uses the first 72 bytes, so longer passwords are refused.
export const checkPassword = (value) => {
  const password = typeof value === 'string' ? value : '';
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
  if (password.length > 72) throw new ApiError(400, 'Password must be at most 72 characters');
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) throw new ApiError(400, 'Password must contain a letter and a number');
  return password;
};

export const checkName = (value) => {
  const name = str(value);
  if (name.length < 2 || name.length > 60) throw new ApiError(400, 'Name must be 2 to 60 characters');
  return name;
};

export const checkPhone = (value, required = false) => {
  const phone = str(value);
  if (!phone) {
    if (required) throw new ApiError(400, 'Phone number is required');
    return undefined;
  }
  if (!PHONE_RX.test(phone)) throw new ApiError(400, 'Enter a valid phone number');
  return phone;
};

export const validateRegister = (b = {}) => ({
  name: checkName(b.name),
  email: checkEmail(b.email),
  phone: checkPhone(b.phone),
  password: checkPassword(b.password),
});

export const validateLogin = (b = {}) => {
  const email = str(b.email).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  if (!email || !password) throw new ApiError(400, 'Email and password are required');
  return { email, password };
};
