import { NextApiRequest, NextApiResponse } from 'next';
import { Adapter } from 'next-auth/adapters';
import { parseCookies, destroyCookie } from 'nookies';

import { prisma } from '../prisma';

export function PrismaAdapter(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res']
): Adapter {
  return {
    async createUser(user) {
      const { '@ignite-call:userId': userIdOnCookies } = parseCookies({ req });

      if (!userIdOnCookies) {
        throw new Error('User not found on cookies');
      }

      const createdUser = await prisma.user.update({
        where: {
          id: userIdOnCookies
        },

        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url
        }
      });

      destroyCookie({ res }, '@ignite-call:userId', {
        path: '/'
      });

      return {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email!,
        emailVerified: null,
        username: createdUser.username,
        avatar_url: createdUser.avatar_url!
      };
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: {
          id: id
        }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: null,
        username: user.username,
        avatar_url: user.avatar_url!
      };
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email: email
        }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: null,
        username: user.username,
        avatar_url: user.avatar_url!
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_provider_account_id: {
            provider: provider,
            provider_account_id: providerAccountId
          }
        },
        include: {
          user: true
        }
      });

      if (!account) {
        return null;
      }

      const { user } = account;

      return {
        id: user.id,
        name: user.name,
        email: user.email!,
        emailVerified: null,
        username: user.username,
        avatar_url: user.avatar_url!
      };
    },

    async updateUser(user) {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id
        },

        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url
        }
      });

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email!,
        emailVerified: null,
        username: updatedUser.username,
        avatar_url: updatedUser.avatar_url!
      };
    },

    async linkAccount(account) {
      await prisma.account.create({
        data: {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state
        }
      });
    },

    async createSession({ sessionToken, userId, expires }) {
      await prisma.session.create({
        data: {
          user_id: userId,
          expires: expires,
          session_token: sessionToken
        }
      });

      return {
        userId,
        sessionToken,
        expires
      };
    },

    async getSessionAndUser(sessionToken) {
      const foundSession = await prisma.session.findUnique({
        where: {
          session_token: sessionToken
        },
        include: {
          user: true
        }
      });

      if (!foundSession) {
        return null;
      }

      const { user, ...session } = foundSession;

      return {
        session: {
          userId: session.user_id,
          expires: session.expires,
          sessionToken: session.session_token
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email!,
          emailVerified: null,
          username: user.username,
          avatar_url: user.avatar_url!
        }
      };
    },

    async updateSession({ sessionToken, userId, expires }) {
      const prismaSession = await prisma.session.update({
        where: {
          session_token: sessionToken
        },

        data: {
          expires: expires,
          user_id: userId
        }
      });

      return {
        sessionToken: prismaSession.session_token,
        userId: prismaSession.user_id,
        expires: prismaSession.expires
      };
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          session_token: sessionToken
        }
      });
      //
    }
  };
}
