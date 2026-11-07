
const josePromise = import("jose");

const KEYCLOAK_ISSUER =
  process.env.KEYCLOAK_ISSUER ||
  "http://localhost:8081/realms/EventFlow";

let jwks;

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Za dostop je potrebna prijava."
      });
    }

    const token = authHeader.split(" ")[1];

    const { createRemoteJWKSet, jwtVerify } = await josePromise;

    if (!jwks) {
      jwks = createRemoteJWKSet(
        new URL(
          `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
        )
      );
    }

    const { payload } = await jwtVerify(token, jwks, {
      issuer: KEYCLOAK_ISSUER
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.preferred_username,
      roles: payload.realm_access?.roles || []
    };

    next();
  } catch (error) {
    console.error("Napaka pri preverjanju JWT:", error.message);

    return res.status(401).json({
      message: "Neveljaven ali potekel prijavni žeton."
    });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles.includes(role)) {
      return res.status(403).json({
        message: "Za dostop nimate ustreznih pravic."
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
