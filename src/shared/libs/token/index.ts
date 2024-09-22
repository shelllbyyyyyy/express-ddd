import jwt from "jsonwebtoken";

import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "@/shared/common/config";

type Payload = {
  sub: string;
  email: string;
};

type TokenPayload = Payload & { exp: number; iat: number };

export class TokenService {
  generateAccessToken(payload: Payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  }

  generateRefreshToken(payload: Payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  }
}
