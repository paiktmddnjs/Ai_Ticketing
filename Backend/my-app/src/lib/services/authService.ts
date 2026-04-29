import { userRepository } from '../repositories/userRepository';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export const authService = {
  async loginWithGoogle(idToken: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid Google token');

      const { sub: googleId, email, name, picture } = payload;
      if (!email) throw new Error('Email not provided by Google');

      let user = await userRepository.findByGoogleId(googleId);

      if (!user) {
        // Check if user exists with this email but no googleId
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
          user = await userRepository.update(existingUser.id, { googleId });
        } else {
          user = await userRepository.create({
            email,
            name: name || email.split('@')[0],
            googleId,
          });
        }
      }

      const { password: _, ...userWithoutPassword } = user;
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('구글 로그인에 실패했습니다.');
    }
  },

  async loginWithGoogleCode(code: string) {
    try {
      const { tokens } = await client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      });
      
      const idToken = tokens.id_token;
      if (!idToken) throw new Error('Failed to get ID token from Google');

      return this.loginWithGoogle(idToken);
    } catch (error) {
      console.error('Google code exchange error:', error);
      throw new Error('구글 인증 코드 교환에 실패했습니다.');
    }
  },

  async login({ email, password }: any) {
    const user = await userRepository.findByEmail(email);

    if (!user || user.password !== password) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    return {
      user: userWithoutPassword,
      token,
    };
  },

  async signup({ email, password, name }: any) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error('이미 가입된 이메일입니다.');
    }

    const user = await userRepository.create({
      email,
      password,
      name,
    });

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    return {
      message: '회원가입이 완료되었습니다.',
      user: userWithoutPassword,
      token,
    };
  },

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await userRepository.findById(decoded.userId);
      
      if (!user) throw new Error('사용자를 찾을 수 없습니다.');

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('인증되지 않은 요청입니다.');
    }
  },
};
