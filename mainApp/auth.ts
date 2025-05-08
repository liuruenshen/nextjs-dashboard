import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { User } from './app/lib/definitions';
import bcrypt from 'bcrypt';
import { getSqlQuery } from './module/getSqlQuery';

const CredentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function getUser(email: string): Promise<User | undefined> {
  const [query, release] = await getSqlQuery();

  try {
    const user = await query<User>`SELECT * FROM users WHERE email=${email}`;

    console.log('🚀 ~ getUser ~ user:', user);
    return user.rows[0];
  } catch (e) {
    console.error('Failed to fetch user:', e);
    throw new Error('Failed to fetch user.');
  } finally {
    release();
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    credentials({
      async authorize(credentials) {
        const parsedCredentials = CredentialSchema.safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            return user;
          }
        }

        return null;
      },
    }),
  ],
});
