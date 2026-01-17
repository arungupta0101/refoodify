import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb-client"

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // User ID ko session mein add karein taaki frontend par use kar sakein
      if (session?.user) {
        session.user.uid = user.id;
        session.user.userType = user.userType || 'user'; // Default role
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
}

export default NextAuth(authOptions)