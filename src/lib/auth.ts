import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { haveIBeenPwned } from "better-auth/plugins";
import { getAppUrl, getTrustedOrigins } from "@/lib/app-url";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  sendExistingAccountNotice,
  sendPasswordResetLink,
  sendVerificationLink,
} from "@/lib/email";

export function isEmailVerificationRequired() {
  if (process.env.REQUIRE_EMAIL_VERIFICATION === "false") {
    return false;
  }
  return true;
}

export const auth = betterAuth({
  baseURL: getAppUrl(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: isEmailVerificationRequired(),
    autoSignIn: !isEmailVerificationRequired(),
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetLink(user.email, url);
    },
    onExistingUserSignUp: async ({ user }) => {
      await sendExistingAccountNotice(user.email);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationLink(user.email, url);
    },
  },
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 8,
  },
  trustedOrigins: getTrustedOrigins(),
  plugins: [
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        "That password has shown up in a data breach. Please choose a different one.",
    }),
    nextCookies(),
  ],
});
