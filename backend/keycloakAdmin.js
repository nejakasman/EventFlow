
const axios = require("axios");

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const CLIENT_ID = process.env.KEYCLOAK_BACKEND_CLIENT_ID;
const CLIENT_SECRET = process.env.KEYCLOAK_BACKEND_CLIENT_SECRET;

async function getAdminToken() {
  if (!KEYCLOAK_URL || !KEYCLOAK_REALM || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Manjkajo nastavitve za povezavo s Keycloakom.");
  }

  const response = await axios.post(
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return response.data.access_token;
}

async function createOrganizationAccount(name, email, password) {
  const token = await getAdminToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const userResponse = await axios.post(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
    {
        username: email,
        email,
        firstName: name,
        lastName: "Organizacija",
        enabled: true,
        emailVerified: false,
        attributes: {
            organizationName: [name]
        }
    },
    { headers }
  );

  const location = userResponse.headers.location;

  if (!location) {
    throw new Error("Keycloak ni vrnil ID-ja ustvarjenega uporabnika.");
  }

  const keycloakId = location.split("/").pop();

  try {
    await axios.put(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}/reset-password`,
      {
        type: "password",
        value: password,
        temporary: false
      },
      { headers }
    );

    const roleResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/roles/ORGANIZER`,
      { headers }
    );

    await axios.post(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}/role-mappings/realm`,
      [roleResponse.data],
      { headers }
    );

    const participantRole = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/roles/PARTICIPANT`,
      { headers }
    );

    await axios.delete(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}/role-mappings/realm`,
      {
        headers,
        data: [participantRole.data]
      }
    );

    return keycloakId;
  } catch (error) {
    try {
      await axios.delete(
        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}`,
        { headers }
      );
    } catch (deleteError) {
      console.error("Brisanje uporabnika iz Keycloaka ni uspelo:", deleteError.message);
    }

    throw error;
  }
}

async function createParticipantAccount(firstName, lastName, email, password) {
  const token = await getAdminToken();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const userResponse = await axios.post(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
    {
      username: email,
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: false
    },
    { headers }
  );

  const location = userResponse.headers.location;

  if (!location) {
    throw new Error("Keycloak ni vrnil ID-ja ustvarjenega uporabnika.");
  }

  const keycloakId = location.split("/").pop();

  try {
    await axios.put(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}/reset-password`,
      {
        type: "password",
        value: password,
        temporary: false
      },
      { headers }
    );

    const roleResponse = await axios.get(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/roles/PARTICIPANT`,
      { headers }
    );

    await axios.post(
      `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}/role-mappings/realm`,
      [roleResponse.data],
      { headers }
    );

    return keycloakId;
  } catch (error) {
    try {
      await axios.delete(
        `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}`,
        { headers }
      );
    } catch (deleteError) {
      console.error(
        "Brisanje uporabnika iz Keycloaka ni uspelo:",
        deleteError.message
      );
    }

    throw error;
  }
}

async function deleteKeycloakUser(keycloakId) {
  const token = await getAdminToken();

  await axios.delete(
    `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${keycloakId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

module.exports = {
  createOrganizationAccount,
  createParticipantAccount,
  deleteKeycloakUser
};
