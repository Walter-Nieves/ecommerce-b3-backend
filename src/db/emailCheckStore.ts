type VerificationEntry = {
  code: string;
  expiresAt: number;
}

const verificationCodes = new Map<string, VerificationEntry>();

const CODE_EXPIRATION_MS = 5 * 60 * 1000;

setInterval(()=>{
  const now = Date.now();

  for (const [email, data] of  verificationCodes.entries()) {
    if (data.expiresAt < now) {
      verificationCodes.delete(email);
    }
  }
},60 * 1000);

export { verificationCodes, CODE_EXPIRATION_MS };