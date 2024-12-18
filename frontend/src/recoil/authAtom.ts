import { atom } from 'recoil';

export const authAtom = atom({
  key: 'authAtom',
  default: {
    isAuthenticated: false,
    userType: '', // 'customer' or 'internal'
    token: '',
    email: null as string | null,
  },
});
