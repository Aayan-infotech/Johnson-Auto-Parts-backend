import jwt from "jsonwebtoken";
import getConfig from "../config/loadConfig";

interface DecodedToken {
  userId: string;
  email: string;
}

export const extractUserFromToken = async (authHeader?: string) => {
  try {
    if (!authHeader) return null; // No token, return null (guest mode)

    const config = await getConfig();
    const token = authHeader.split(" ")[1];

    if (!token) return null;

    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET as string) as DecodedToken;
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.warn("Invalid token, proceeding as guest.");
    return null;
  }
};
