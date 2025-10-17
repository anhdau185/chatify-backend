import type { FastifyRequest } from "fastify";

function getBearerToken(request: FastifyRequest) {
  const bearerToken = request.headers.authorization;

  if (!bearerToken) {
    return null;
  }

  const token = bearerToken.split(" ")[1] as string | undefined;
  if (!token) {
    return null;
  }

  return token;
}

export { getBearerToken };
