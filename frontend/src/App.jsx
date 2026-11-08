
import keycloak from './keycloak'
import './App.css'
import React, { useEffect, useState } from 'react'

function App() {
  const isAuthenticated = keycloak.authenticated
  const [syncMessage, setSyncMessage] = useState('')
  const [registrationView, setRegistrationView] = useState('closed')
  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [registrationError, setRegistrationError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const user = keycloak.tokenParsed
  const roles = user?.realm_access?.roles || []

  const appRoles = roles.includes('ADMIN')
    ? ['ADMIN']
    : roles.includes('ORGANIZER')
      ? ['ORGANIZER']
      : roles.includes('PARTICIPANT')
        ? ['PARTICIPANT']
        : []

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

      const userRoles = keycloak.tokenParsed?.realm_access?.roles || []

      if (userRoles.includes('ORGANIZER')) return

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

    useEffect(() => {
    const url = new URL(window.location.href)

    if (url.searchParams.get('registration') === '1') {
      setRegistrationView('choose')

      url.searchParams.delete('registration')
      window.history.replaceState({}, '', url.pathname)
    }
  }, [])

  const handleLogin = () => {
    keycloak.login()
  }

  const openRegistration = () => {
    setRegistrationView('choose')
    setRegistrationMessage('')
    setRegistrationError(false)
  }

  const handleParticipantRegistration = () => {
    keycloak.register()
  }

  const handleOrganizationFormChange = (event) => {
    const { name, value } = event.target

    setOrganizationForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const handleOrganizationRegistration = async (event) => {
    event.preventDefault()

    setIsSubmitting(true)
    setRegistrationMessage('')
    setRegistrationError(false)

    try {
      const response = await fetch(
        'http://localhost:3000/api/organizations/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(organizationForm)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registracija ni uspela.')
      }

      setRegistrationMessage(
        'Registracija organizacije je bila uspešna. Zdaj se lahko prijavite.'
      )

      setOrganizationForm({
        name: '',
        email: '',
        password: ''
      })
    } catch (error) {
      setRegistrationError(true)
      setRegistrationMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
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
              <button
                className="button button-primary"
                onClick={openRegistration}
              >
                Registracija
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <section
          className={`hero ${registrationView !== 'closed' ? 'hero-registration' : ''}`}
          id="about"
        >
          <div className="hero-background">
            <img
              src="/concert-hero.png"
              alt=""
              className="hero-background-image"
            />
            <div className="hero-overlay"></div>
          </div>

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
            ) : registrationView === 'closed' ? (
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
                    onClick={openRegistration}
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

                <div className="hero-bottom-note">
                  <span></span>
                  Vse za tvoje naslednje doživetje.
                  <span></span>
                </div>
              </>
            ) : registrationView === 'choose' ? (
              <div className="registration-panel">
                <span className="section-label">USTVARI SVOJ RAČUN</span>

                <h1>
                  Kako se želiš<br />
                  <span>registrirati?</span>
                </h1>

                <p className="hero-description">
                  Izberi vrsto računa, ki najbolje ustreza tvoji uporabi
                  platforme.
                </p>

                <div className="account-choice-grid">
                  <button
                    className="account-choice"
                    onClick={handleParticipantRegistration}
                  >
                    <span className="choice-icon">♙</span>
                    <strong>Udeleženec</strong>
                    <span>
                      Odkrij dogodke in se prijavi na tiste, ki te zanimajo.
                    </span>
                    <span className="choice-arrow">→</span>
                  </button>

                  <button
                    className="account-choice"
                    onClick={() => {
                      setRegistrationView('organization')
                      setRegistrationMessage('')
                    }}
                  >
                    <span className="choice-icon">✳</span>
                    <strong>Organizacija</strong>
                    <span>
                      Ustvarjaj dogodke in upravljaj prijave udeležencev.
                    </span>
                    <span className="choice-arrow">→</span>
                  </button>
                </div>

                <button
                  className="back-link"
                  onClick={() => setRegistrationView('closed')}
                >
                  ← Nazaj na začetno stran
                </button>
              </div>
            ) : (
              <div className="registration-panel">
                <span className="section-label">ORGANIZACIJSKI RAČUN</span>

                <h1>
                  Registracija<br />
                  <span>organizacije.</span>
                </h1>

                <p className="form-description">
                  Ustvari račun za svojo organizacijo in začni objavljati
                  dogodke.
                </p>

                <form
                  className="registration-form"
                  onSubmit={handleOrganizationRegistration}
                >
                  <label htmlFor="organization-name">Ime organizacije</label>
                  <input
                    id="organization-name"
                    name="name"
                    type="text"
                    placeholder="Vnesi ime organizacije"
                    value={organizationForm.name}
                    onChange={handleOrganizationFormChange}
                    required
                  />

                  <label htmlFor="organization-email">E-poštni naslov</label>
                  <input
                    id="organization-email"
                    name="email"
                    type="email"
                    placeholder="ime@organizacija.si"
                    value={organizationForm.email}
                    onChange={handleOrganizationFormChange}
                    required
                  />

                  <label htmlFor="organization-password">Geslo</label>
                  <input
                    id="organization-password"
                    name="password"
                    type="password"
                    placeholder="Ustvari geslo"
                    value={organizationForm.password}
                    onChange={handleOrganizationFormChange}
                    minLength={8}
                    required
                  />

                  <button
                    className="button button-primary button-large form-submit"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registracija ...' : 'Ustvari račun'}
                  </button>
                </form>

                {registrationMessage && (
                  <div
                    className={`form-message ${
                      registrationError ? 'form-error' : 'form-success'
                    }`}
                  >
                    {registrationMessage}

                    {!registrationError && (
                      <button
                        className="message-login"
                        onClick={handleLogin}
                      >
                        Prijavi se
                      </button>
                    )}
                  </div>
                )}

                <button
                  className="back-link"
                  onClick={() => {
                    setRegistrationView('choose')
                    setRegistrationMessage('')
                  }}
                >
                  ← Nazaj na izbiro računa
                </button>
              </div>
            )}
          </div>
        </section>

        {registrationView === 'closed' && (
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
        )}
      </main>

      {registrationView === 'closed' && (
        <footer className="footer">
          <a href="#" className="brand footer-brand">
            <span className="brand-icon">E</span>
            <span>eventflow</span>
          </a>

          <span>Organiziraj. Poveži. Doživi.</span>
          <span>© 2026 EventFlow</span>
        </footer>
      )}
    </div>
  )
}


export default App
