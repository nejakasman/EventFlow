import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8081",
  realm: "EventFlow",
  clientId: "eventflow-frontend"
});

export default keycloak;