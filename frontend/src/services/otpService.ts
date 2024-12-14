const otps: Record<string, { email: string; phone: string }> = {};

export const generateOTP = (length: number = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
};

export const sendEmailOTP = async (email: string) => {
  const otp = generateOTP();
  otps[email] = { ...otps[email], email: otp };
  console.log(`Email OTP for ${email}: ${otp}`);
  return otp;
};

export const sendPhoneOTP = async (phone: string) => {
  const otp = generateOTP();
  otps[phone] = { ...otps[phone], phone: otp };
  console.log(`Phone OTP for ${phone}: ${otp}`);
  return otp;
};

export const verifyOTP = (identifier: string, type: 'email' | 'phone', otp: string) => {
  return otps[identifier]?.[type] === otp;
};

