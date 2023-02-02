import { Adapter } from 'next-auth/adapters';

import { prisma } from '../prisma';

export function PrismaAdapter(): Adapter {
  return {
    async createUser(user) {
      return null;
    },

    async getUser(id) {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: id
        }
      });

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
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: email
        }
      });

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
      const { user } = await prisma.account.findUniqueOrThrow({
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
      const { user, ...session } = await prisma.session.findUniqueOrThrow({
        where: {
          session_token: sessionToken
        },
        include: {
          user: true
        }
      });

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
    }
  };
}
