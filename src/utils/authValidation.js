export const validatePasswordForSubmit = (password, isLogin) => {
  if (!password) return 'Password is required.';

  if (password.includes(' ') || password.includes('\t')) {
    return 'Password cannot contain spaces or tabs.';
  }

  if (isLogin) {
    return null;
  }

  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character.';
  }

  return null;
};
