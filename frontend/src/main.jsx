
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import keycloak from './keycloak'

keycloak.init({
  onLoad: 'check-sso',
  pkceMethod: 'S256',
  checkLoginIframe: false
}).then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((error) => {
  console.error('Napaka pri povezavi s Keycloakom:', error)
})
