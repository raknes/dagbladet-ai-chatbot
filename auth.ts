import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter"
import { Redis } from "@upstash/redis"
import NextAuth from 'next-auth'
// import Resend from "next-auth/providers/resend";
import Sendgrid from "next-auth/providers/sendgrid"
import { authConfig } from './auth.config'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: UpstashRedisAdapter(redis, { baseKeyPrefix: "dagbladet-ai-chatbot:" }),
  providers: [
    // Resend({ from: "signin@email.mediehub.net" }),
    Sendgrid({
      from: 'signin@mediehub.net',
    }),
  ]
})
