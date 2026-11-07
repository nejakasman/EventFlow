
import keycloak from './keycloak'
import './App.css'
import React, { useEffect, useState } from 'react'

function App() {
  const isAuthenticated = keycloak.authenticated
  const [syncMessage, setSyncMessage] = useState('')

  const user = keycloak.tokenParsed
  const roles = user?.realm_access?.roles || []

  const appRoles = roles.filter(role =>
    ['PARTICIPANT', 'ORGANIZER', 'ADMIN'].includes(role)
  )

  const roleNames = {
    PARTICIPANT: 'Udeleženec',
    ORGANIZER: 'Organizator',
    ADMIN: 'Administrator'
  }

  const userName =
    user?.given_name ||
    user?.name ||
    user?.preferred_username ||
    'uporabnik'

  useEffect(() => {
    const syncUser = async () => {
      if (!keycloak.authenticated) return

      try {
        const response = await fetch('http://localhost:3000/api/users/me', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        setSyncMessage('Podatki uporabnika so uspešno shranjeni.')
      } catch (error) {
        console.error('Napaka pri shranjevanju uporabnika:', error)
        setSyncMessage('Shranjevanje uporabnika ni uspelo.')
      }
    }

    syncUser()
  }, [])

  const handleLogin = () => {
    keycloak.login()
  }

  const handleRegister = () => {
    keycloak.register()
  }

  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin
    })
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <a href="#" className="brand">
          <span className="brand-icon">E</span>
          <span>eventflow</span>
        </a>

        <nav className="nav-links">
          <a href="#about">O platformi</a>
          <a href="#features">Kaj ponujamo</a>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="nav-user">{userName}</span>
              <button className="button button-outline" onClick={handleLogout}>
                Odjava
              </button>
            </>
          ) : (
            <>
              <button className="button button-text" onClick={handleLogin}>
                Prijava
              </button>
              <button className="button button-primary" onClick={handleRegister}>
                Registracija
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero" id="about">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              TVOJ PROSTOR ZA DOGODKE
            </div>

            {isAuthenticated ? (
              <>
                <h1>
                  Dobrodošel,<br />
                  <span>{userName}.</span>
                </h1>

                <p className="hero-description">
                  Veseli nas, da si z nami. Odkrij nove dogodke in poišči
                  priložnosti za nepozabna doživetja.
                </p>

                <div className="user-info">
                  <span className="user-info-label">Prijavljen uporabnik</span>
                  <strong>{user?.email || user?.preferred_username}</strong>
                  <span className="user-role">
                    {appRoles.length > 0
                      ? appRoles.map(role => roleNames[role]).join(', ')
                      : 'Brez določene vloge'}
                  </span>
                  {syncMessage && <p>{syncMessage}</p>}
                </div>
              </>
            ) : (
              <>
                <h1>
                  Dogodki, ki<br />
                  <span>povezujejo.</span>
                </h1>

                <p className="hero-description">
                  Odkrij zanimive dogodke, spoznaj nove ljudi in ustvari
                  nepozabne trenutke. Vse na enem mestu.
                </p>

                <div className="hero-actions">
                  <button
                    className="button button-primary button-large"
                    onClick={handleRegister}
                  >
                    Ustvari račun <span>→</span>
                  </button>

                  <button
                    className="button button-outline button-large"
                    onClick={handleLogin}
                  >
                    Že imam račun
                  </button>
                </div>
              </>
            )}

            <div className="hero-note">
              <span className="note-line"></span>
              Vse za tvoje naslednje doživetje.
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow"></div>

            <div className="visual-card">
              <div className="visual-top">
                <span className="visual-label">EVENTFLOW</span>
                <span className="visual-number">01 / 03</span>
              </div>

              <div className="visual-art">
                <div className="art-circle art-circle-one"></div>
                <div className="art-circle art-circle-two"></div>
                <div className="art-line"></div>
                <span className="art-text">MAKE<br />MEMORIES</span>
              </div>

              <div className="visual-bottom">
                <div>
                  <span className="visual-caption">ODKRIJ. DOŽIVI. POVEŽI.</span>
                  <h3>Tvoj naslednji dogodek se začne tukaj.</h3>
                </div>
                <span className="visual-arrow">↗</span>
              </div>
            </div>

            <div className="floating-tag">
              <span className="floating-tag-dot"></span>
              Tvoj svet dogodkov
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="section-heading">
            <div>
              <span className="section-label">ZAKAJ EVENTFLOW?</span>
              <h2>Vse na enem mestu.</h2>
            </div>

            <p>
              Preprosta pot od iskanja dogodka do nove izkušnje.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-number">01</span>
              <div className="feature-icon">⌕</div>
              <h3>Odkrij dogodke</h3>
              <p>
                Razišči različne dogodke in poišči tiste, ki ustrezajo
                tvojim interesom.
              </p>
            </article>

            <article className="feature-card feature-card-highlight">
              <span className="feature-number">02</span>
              <div className="feature-icon">↗</div>
              <h3>Preprosta prijava</h3>
              <p>
                Prijavi se na izbrani dogodek in spremljaj svoje prijave
                na enem mestu.
              </p>
            </article>

            <article className="feature-card">
              <span className="feature-number">03</span>
              <div className="feature-icon">✳</div>
              <h3>Organiziraj dogodke</h3>
              <p>
                Ustvari dogodek, predstavi svojo organizacijo in upravljaj
                prijave udeležencev.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a href="#" className="brand footer-brand">
          <span className="brand-icon">E</span>
          <span>eventflow</span>
        </a>

        <span>Organiziraj. Poveži. Doživi.</span>
        <span>© 2026 EventFlow</span>
      </footer>
    </div>
  )
}

export default App
