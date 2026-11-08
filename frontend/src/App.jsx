
import keycloak from './keycloak'
import './App.css'
import React, { useEffect, useState } from 'react'

function App() {
  const isAuthenticated = keycloak.authenticated

  const [registrationView, setRegistrationView] = useState('closed')
  const [organizerView, setOrganizerView] = useState('home')

  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [registrationMessage, setRegistrationMessage] = useState('')
  const [registrationError, setRegistrationError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    categoryId: ''
  })

  const [eventMessage, setEventMessage] = useState('')
  const [eventError, setEventError] = useState(false)

  const [myEvents, setMyEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsMessage, setEventsMessage] = useState('')
  const [eventsError, setEventsError] = useState(false)
  const [publishingEventId, setPublishingEventId] = useState(null)

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventRegistrations, setEventRegistrations] = useState([])
  const [eventRegistrationCounts, setEventRegistrationCounts] = useState({
    confirmed_count: 0,
    waitlisted_count: 0,
    cancelled_count: 0
  })
  const [eventRegistrationsLoading, setEventRegistrationsLoading] = useState(false)
  const [eventRegistrationsMessage, setEventRegistrationsMessage] = useState('')
  const [eventRegistrationsError, setEventRegistrationsError] = useState(false)

  const [myRegistrations, setMyRegistrations] = useState([])
  const [myRegistrationsLoading, setMyRegistrationsLoading] = useState(false)
  const [myRegistrationsMessage, setMyRegistrationsMessage] = useState('')
  const [myRegistrationsError, setMyRegistrationsError] = useState(false)
  const [cancellingRegistrationId, setCancellingRegistrationId] = useState(null)

  const [publicEvents, setPublicEvents] = useState([])
  const [publicEventsLoading, setPublicEventsLoading] = useState(false)
  const [publicEventsError, setPublicEventsError] = useState('')
  const [eventSearch, setEventSearch] = useState('')
  const [eventCategoryFilter, setEventCategoryFilter] = useState('')
  const [eventDateFilter, setEventDateFilter] = useState('')

  const [registrationStatuses, setRegistrationStatuses] = useState({})
  const [registrationMessages, setRegistrationMessages] = useState({})
  const [registeringEventId, setRegisteringEventId] = useState(null)

  const user = keycloak.tokenParsed
  const userRoles = user?.realm_access?.roles || []

  const isOrganizer =
    isAuthenticated && userRoles.includes('ORGANIZER')

  const isParticipant =
    isAuthenticated && userRoles.includes('PARTICIPANT')

  const userName =
    user?.given_name ||
    user?.name ||
    user?.preferred_username ||
    'uporabnik'

  useEffect(() => {
    const syncUser = async () => {
      if (!keycloak.authenticated) return

      const roles = keycloak.tokenParsed?.realm_access?.roles || []

      if (roles.includes('ORGANIZER')) return

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
      } catch (error) {
        console.error('Napaka pri shranjevanju uporabnika:', error)
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

  const handleEventFormChange = (event) => {
    const { name, value } = event.target

    setEventForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const handleEventSubmit = async (event) => {
    event.preventDefault()

    setIsSubmitting(true)
    setEventMessage('')
    setEventError(false)

    try {
      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`
        },
        body: JSON.stringify({
          ...eventForm,
          startDate: new Date(eventForm.startDate).toISOString(),
          endDate: new Date(eventForm.endDate).toISOString(),
          registrationDeadline: new Date(
            eventForm.registrationDeadline
          ).toISOString(),
          maxParticipants: Number(eventForm.maxParticipants),
          categoryId: Number(eventForm.categoryId)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Ustvarjanje dogodka ni uspelo.')
      }

      setEventMessage(
        'Dogodek je bil uspešno ustvarjen kot osnutek.'
      )

      setEventForm({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        maxParticipants: '',
        categoryId: ''
      })
    } catch (error) {
      setEventError(true)
      setEventMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadMyEvents = async () => {
    setEventsLoading(true)
    setEventsMessage('')
    setEventsError(false)

    try {
      const response = await fetch('http://localhost:3000/api/events/my', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Pridobivanje dogodkov ni uspelo.')
      }

      setMyEvents(data.events || [])
    } catch (error) {
      setEventsError(true)
      setEventsMessage(error.message)
    } finally {
      setEventsLoading(false)
    }
  }

  const handleOpenMyEvents = () => {
    setOrganizerView('myEvents')
    setRegistrationView('closed')
    loadMyEvents()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loadEventRegistrations = async (event) => {
    setEventRegistrationsLoading(true)
    setEventRegistrationsMessage('')
    setEventRegistrationsError(false)
    setEventRegistrations([])
    setEventRegistrationCounts({
      confirmed_count: 0,
      waitlisted_count: 0,
      cancelled_count: 0
    })

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/${event.id}/registrations`,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Pridobivanje prijav ni uspelo.'
        )
      }

      setSelectedEvent(data.event || event)
      setEventRegistrations(data.registrations || [])
      setEventRegistrationCounts(data.counts || {
        confirmed_count: 0,
        waitlisted_count: 0,
        cancelled_count: 0
      })
    } catch (error) {
      setEventRegistrationsError(true)
      setEventRegistrationsMessage(error.message)
    } finally {
      setEventRegistrationsLoading(false)
    }
  }

  const handleOpenEventRegistrations = (event) => {
    setSelectedEvent(event)
    setOrganizerView('eventRegistrations')
    setRegistrationView('closed')
    loadEventRegistrations(event)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenMyRegistrations = () => {
    setOrganizerView('myRegistrations')
    setRegistrationView('closed')
    loadMyRegistrations()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loadMyRegistrations = async () => {
    setMyRegistrationsLoading(true)
    setMyRegistrationsMessage('')
    setMyRegistrationsError(false)

    try {
      const response = await fetch(
        'http://localhost:3000/api/registrations/my',
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Pridobivanje prijav ni uspelo.'
        )
      }

      setMyRegistrations(data.registrations || [])
    } catch (error) {
      setMyRegistrationsError(true)
      setMyRegistrationsMessage(error.message)
    } finally {
      setMyRegistrationsLoading(false)
    }
  }

  const handleCancelRegistration = async (registration) => {
    const confirmed = window.confirm(
      `Ali res želiš odpovedati prijavo na dogodek "${registration.title}"?`
    )

    if (!confirmed) return

    setCancellingRegistrationId(registration.registration_id)
    setMyRegistrationsMessage('')
    setMyRegistrationsError(false)

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/${registration.event_id}/cancel-registration`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Odpoved prijave ni uspela.'
        )
      }

      await loadMyRegistrations()

      setMyRegistrationsMessage(
        'Prijava je bila uspešno odpovedana.'
      )
    } catch (error) {
      setMyRegistrationsError(true)
      setMyRegistrationsMessage(error.message)
    } finally {
      setCancellingRegistrationId(null)
    }
  }

  const handlePublishEvent = async (eventId) => {
    setPublishingEventId(eventId)
    setEventsMessage('')
    setEventsError(false)

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}/publish`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${keycloak.token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Objava dogodka ni uspela.')
      }

      setMyEvents(previous =>
        previous.map(event =>
          event.id === eventId
            ? { ...event, status: 'PUBLISHED' }
            : event
        )
      )

      setEventsMessage('Dogodek je bil uspešno objavljen.')
    } catch (error) {
      setEventsError(true)
      setEventsMessage(error.message)
    } finally {
      setPublishingEventId(null)
    }
  }

  const loadPublicEvents = async (filters = {}) => {
    setPublicEventsLoading(true)
    setPublicEventsError('')

    const params = new URLSearchParams()

    if (filters.search?.trim()) {
      params.set('search', filters.search.trim())
    }

    if (filters.categoryId) {
      params.set('categoryId', filters.categoryId)
    }

    if (filters.date) {
      params.set('date', filters.date)
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/events?${params.toString()}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Dogodkov ni bilo mogoče naložiti.')
      }

      setPublicEvents(data.events || [])
    } catch (error) {
      setPublicEventsError(error.message)
    } finally {
      setPublicEventsLoading(false)
    }
  }

  const handleOpenDiscover = (categoryId = '') => {
    setOrganizerView('discover')
    setRegistrationView('closed')
    setEventSearch('')
    setEventCategoryFilter(categoryId)
    setEventDateFilter('')

    loadPublicEvents({
      categoryId
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApplyEventFilters = (event) => {
    event.preventDefault()

    loadPublicEvents({
      search: eventSearch,
      categoryId: eventCategoryFilter,
      date: eventDateFilter
    })
  }

  const handleResetEventFilters = () => {
    setEventSearch('')
    setEventCategoryFilter('')
    setEventDateFilter('')
    loadPublicEvents()
  }

  const handleEventRegistration = async (eventId) => {
    if (!isAuthenticated) {
      keycloak.login()
      return
    }

    if (!isParticipant || isOrganizer) {
      return
    }

    setRegisteringEventId(eventId)

    setRegistrationMessages(previous => ({
      ...previous,
      [eventId]: ''
    }))

    try {
      const response = await fetch(
        `http://localhost:3000/api/events/${eventId}/register`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (data.registration?.status) {
        setRegistrationStatuses(previous => ({
          ...previous,
          [eventId]: data.registration.status
        }))
      }

      if (!response.ok) {
        throw new Error(data.message || 'Prijava na dogodek ni uspela.')
      }

      const status = data.registration?.status

      setRegistrationStatuses(previous => ({
        ...previous,
        [eventId]: status
      }))

      setRegistrationMessages(previous => ({
        ...previous,
        [eventId]:
          status === 'WAITLISTED'
            ? 'Dogodek je poln. Uspešno si dodan/a na čakalni seznam.'
            : 'Uspešno si prijavljen/a na dogodek!'
      }))
    } catch (error) {
      setRegistrationMessages(previous => ({
        ...previous,
        [eventId]: error.message
      }))
    } finally {
      setRegisteringEventId(null)
    }
  }

  const formatDate = (date) => {
    if (!date) return ''

    return new Date(date).toLocaleString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin
    })
  }

  const eventImages = {
    1: '/images/events/koncerti.jpg',
    2: '/images/events/sport.jpg',
    3: '/images/events/izobrazevanje.jpg',
    4: '/images/events/kultura.jpg',
    5: '/images/events/kultura.jpg'
  }

  return (
    <div className="app-shell">
    <header
      className={`navbar ${
        organizerView === 'home' || organizerView === 'create'
          ? 'navbar-home'
          : 'navbar-light'
      }`}
    >
      <a
        href="#"
        className="brand"
        onClick={(event) => {
          event.preventDefault()
          setOrganizerView('home')
          setRegistrationView('closed')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      >
        <span className="brand-icon">E</span>
        <span>eventflow</span>
      </a>

      <div className="nav-actions">
        <button
          className={`button ${
            organizerView === 'discover'
              ? 'button-primary'
              : 'button-outline'
          }`}
          onClick={() => handleOpenDiscover()}
        >
          Odkrij dogodke
        </button>

        {isAuthenticated ? (
          <>
            {isOrganizer && (
              <>
                <button
                  className={`button ${
                    organizerView === 'myEvents' ||
                    organizerView === 'eventRegistrations'
                      ? 'button-primary'
                      : 'button-outline'
                  }`}
                  onClick={handleOpenMyEvents}
                >
                  Moji dogodki
                </button>

                <button
                  className={`button ${
                    organizerView === 'create'
                      ? 'button-primary'
                      : 'button-outline'
                  }`}
                  onClick={() => {
                    setOrganizerView('create')
                    setRegistrationView('closed')
                    setEventMessage('')
                    setEventError(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Ustvari dogodek
                </button>
              </>
            )}

            {isParticipant && !isOrganizer && (
              <button
                className={`button ${
                  organizerView === 'myRegistrations'
                    ? 'button-primary'
                    : 'button-outline'
                }`}
                onClick={handleOpenMyRegistrations}
              >
                Moje prijave
              </button>
            )}

            <div className="nav-profile">
              <div className="nav-avatar">
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </div>

              <div className="nav-profile-info">
                <span className="nav-profile-name">{userName}</span>
                <span className="nav-profile-role">
                  {isOrganizer ? 'Organizator' : 'Udeleženec'}
                </span>
              </div>
            </div>

            <button
              className="button button-outline"
              onClick={handleLogout}
            >
              Odjava
            </button>
          </>
        ) : (
          <>
            <button
              className="button button-text"
              onClick={handleLogin}
            >
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
          className={`hero ${
            registrationView !== 'closed' ||
            organizerView === 'create' ||
            organizerView === 'myEvents' ||
            organizerView === 'myRegistrations' ||
            organizerView === 'eventRegistrations' ||
            organizerView === 'discover'
              ? 'hero-registration'
              : ''
          } ${
            organizerView === 'myEvents' ||
            organizerView === 'myRegistrations' ||
            organizerView === 'eventRegistrations'
              ? 'hero-my-events'
              : organizerView === 'discover'
                ? 'hero-discover'
                : ''
          }`}
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
            {organizerView === 'discover' ? (
              <div className="discover-panel">
                <div className="discover-heading">
                  <span className="section-label">RAZIŠČI EVENTFLOW</span>

                  <h1>
                    Odkrij svoje naslednje <span>doživetje.</span>
                  </h1>

                  <p>
                    Koncerti, šport, kultura in še veliko več.
                    Poišči dogodek, ki ti je pisan na kožo.
                  </p>
                </div>

                <div className="discover-categories">
                  <button
                    className={`category-tile ${
                      eventCategoryFilter === '1'
                        ? 'category-tile-active'
                        : ''
                    }`}
                    onClick={() => handleOpenDiscover('1')}
                  >
                    <img src="/images/events/koncerti.jpg" alt="Koncerti" />
                    <span className="category-tile-overlay"></span>
                    <span className="category-tile-content">
                      <small>01 / GLASBA</small>
                      <strong>Koncerti</strong>
                      <span>Odkrij glasbena doživetja →</span>
                    </span>
                  </button>

                  <button
                    className={`category-tile ${
                      eventCategoryFilter === '2'
                        ? 'category-tile-active'
                        : ''
                    }`}
                    onClick={() => handleOpenDiscover('2')}
                  >
                    <img src="/images/events/sport.jpg" alt="Šport" />
                    <span className="category-tile-overlay"></span>
                    <span className="category-tile-content">
                      <small>02 / AKTIVNOST</small>
                      <strong>Šport</strong>
                      <span>Najdi svojo naslednjo aktivnost →</span>
                    </span>
                  </button>

                  <button
                    className={`category-tile ${
                      eventCategoryFilter === '3'
                        ? 'category-tile-active'
                        : ''
                    }`}
                    onClick={() => handleOpenDiscover('3')}
                  >
                    <img
                      src="/images/events/izobrazevanje.jpg"
                      alt="Izobraževanje"
                    />
                    <span className="category-tile-overlay"></span>
                    <span className="category-tile-content">
                      <small>03 / ZNANJE</small>
                      <strong>Izobraževanje</strong>
                      <span>Nauči se nekaj novega →</span>
                    </span>
                  </button>

                  <button
                    className={`category-tile ${
                      eventCategoryFilter === '4'
                        ? 'category-tile-active'
                        : ''
                    }`}
                    onClick={() => handleOpenDiscover('4')}
                  >
                    <img src="/images/events/kultura.jpg" alt="Kultura" />
                    <span className="category-tile-overlay"></span>
                    <span className="category-tile-content">
                      <small>04 / UMETNOST</small>
                      <strong>Kultura</strong>
                      <span>Doživi nekaj drugačnega →</span>
                    </span>
                  </button>
                </div>

                <div className="discover-events-section">
                  <div className="discover-events-heading">
                    <div>
                      <span className="section-label">
                        TVOJ NASLEDNJI DOGODEK
                      </span>
                      <h2>Razišči dogodke.</h2>
                      <p>
                        Izberi, kaj te zanima, in poišči nekaj zase.
                      </p>
                    </div>

                    <span className="discover-event-count">
                      {publicEvents.length}{' '}
                      {publicEvents.length === 1
                        ? 'dogodek'
                        : publicEvents.length === 2
                          ? 'dogodka'
                          : 'dogodkov'}
                    </span>
                  </div>

                  <form
                    className="discover-filters"
                    onSubmit={handleApplyEventFilters}
                  >
                    <div className="discover-search">
                      <label htmlFor="event-search">Išči dogodek</label>
                      <input
                        id="event-search"
                        type="text"
                        placeholder="Npr. Poletni glasbeni večer ..."
                        value={eventSearch}
                        onChange={(event) =>
                          setEventSearch(event.target.value)
                        }
                      />
                    </div>

                    <div className="discover-filter">
                      <label htmlFor="event-category-filter">
                        Kategorija
                      </label>
                      <select
                        id="event-category-filter"
                        value={eventCategoryFilter}
                        onChange={(event) =>
                          setEventCategoryFilter(event.target.value)
                        }
                      >
                        <option value="">Vse kategorije</option>
                        <option value="1">Koncerti</option>
                        <option value="2">Šport</option>
                        <option value="3">Izobraževanje</option>
                        <option value="4">Kultura</option>
                        <option value="5">Drugo</option>
                      </select>
                    </div>

                    <div className="discover-filter">
                      <label htmlFor="event-date-filter">
                        Datum dogodka
                      </label>
                      <input
                        id="event-date-filter"
                        type="date"
                        value={eventDateFilter}
                        onChange={(event) =>
                          setEventDateFilter(event.target.value)
                        }
                      />
                    </div>

                    <button
                      className="button button-primary discover-filter-button"
                      type="submit"
                    >
                      Išči dogodke
                    </button>

                    <button
                      className="discover-reset-button"
                      type="button"
                      onClick={handleResetEventFilters}
                    >
                      Ponastavi
                    </button>
                  </form>

                  {publicEventsLoading ? (
                    <div className="discover-message">
                      Nalaganje dogodkov ...
                    </div>
                  ) : publicEventsError ? (
                    <div className="form-message form-error">
                      {publicEventsError}
                    </div>
                  ) : publicEvents.length === 0 ? (
                    <div className="discover-empty">
                      <div className="discover-empty-icon">⌕</div>
                      <h3>Trenutno ni dogodkov.</h3>
                      <p>
                        Poskusi spremeniti iskalne pogoje ali preveri
                        ponovno pozneje.
                      </p>
                      <button
                        className="button button-outline discover-empty-button"
                        onClick={handleResetEventFilters}
                      >
                        Prikaži vse dogodke
                      </button>
                    </div>
                  ) : (
                    <div className="discover-event-grid">
                      {publicEvents.map(event => (
                        <article
                          className="discover-event-card"
                          key={event.id}
                        >
                          <div className="discover-event-image">
                            <img
                              src={
                                eventImages[event.category_id] ||
                                eventImages[5]
                              }
                              alt={event.category_name}
                            />
                            <span className="discover-event-category">
                              {event.category_name}
                            </span>
                          </div>

                          <div className="discover-event-content">
                            <div className="discover-event-date">
                              <span>◷</span>
                              {formatDate(event.start_date)}
                            </div>

                            <h3>{event.title}</h3>

                            <p className="discover-event-description">
                              {event.description ||
                                'Več informacij o dogodku kmalu.'}
                            </p>

                            <div className="discover-event-info">
                              <span>⌖ {event.location}</span>
                              <span>✳ {event.organization_name}</span>
                            </div>

                            <div className="discover-event-bottom">
                              <span>
                                Do {event.max_participants} udeležencev
                              </span>
                              <span className="discover-event-arrow">
                                →
                              </span>
                            </div>

                            {!isOrganizer &&
                              (!isAuthenticated || isParticipant) && (
                                <div className="event-registration">
                                  <button
                                    className="button button-primary event-register-button"
                                    onClick={() =>
                                      handleEventRegistration(event.id)
                                    }
                                    disabled={
                                      registeringEventId === event.id ||
                                      registrationStatuses[event.id] ===
                                        'CONFIRMED' ||
                                      registrationStatuses[event.id] ===
                                        'WAITLISTED'
                                    }
                                  >
                                    {registeringEventId === event.id
                                      ? 'Prijavljanje ...'
                                      : registrationStatuses[event.id] ===
                                          'CONFIRMED'
                                        ? 'Prijavljen/a'
                                        : registrationStatuses[event.id] ===
                                            'WAITLISTED'
                                          ? 'Na čakalnem seznamu'
                                          : isAuthenticated
                                            ? 'Prijavi se na dogodek'
                                            : 'Prijavi se'}
                                  </button>

                                  {registrationMessages[event.id] && (
                                    <p
                                      className={`event-registration-message ${
                                        registrationStatuses[event.id]
                                          ? 'registration-success'
                                          : 'registration-error'
                                      }`}
                                    >
                                      {registrationMessages[event.id]}
                                    </p>
                                  )}
                                </div>
                              )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="back-link discover-back-link"
                  onClick={() => setOrganizerView('home')}
                >
                  ← Nazaj na začetno stran
                </button>
              </div>
            ) : organizerView === 'myRegistrations' && isParticipant ? (
              <div className="my-events-panel my-registrations-panel">
                <span className="section-label">MOJ EVENTFLOW</span>

                <h1>
                  Moje <span>prijave.</span>
                </h1>

                <p className="form-description">
                  Tukaj lahko spremljaš dogodke, na katere si prijavljen/a,
                  in po potrebi odpoveš svojo prijavo.
                </p>

                {myRegistrationsMessage && (
                  <div
                    className={`form-message ${
                      myRegistrationsError ? 'form-error' : 'form-success'
                    }`}
                  >
                    {myRegistrationsMessage}
                  </div>
                )}

                {myRegistrationsLoading ? (
                  <div className="events-info">
                    Nalaganje prijav ...
                  </div>
                ) : myRegistrationsError && myRegistrations.length === 0 ? (
                  <div className="events-empty">
                    <h2>Prijav ni bilo mogoče naložiti.</h2>
                    <p>{myRegistrationsMessage}</p>
                    <button
                      className="button button-primary"
                      onClick={loadMyRegistrations}
                    >
                      Poskusi znova
                    </button>
                  </div>
                ) : myRegistrations.length === 0 ? (
                  <div className="events-empty">
                    <div className="events-empty-icon">✳</div>
                    <h2>Še nimaš prijav.</h2>
                    <p>
                      Ko se prijaviš na dogodek, se bo ta prikazal tukaj.
                    </p>
                    <button
                      className="button button-primary"
                      onClick={() => handleOpenDiscover()}
                    >
                      Odkrij dogodke
                    </button>
                  </div>
                ) : (
                  <div className="my-events-list my-registrations-list">
                    {myRegistrations.map(registration => (
                      <article
                        className="my-event-card my-registration-card"
                        key={registration.registration_id}
                      >
                        <div className="my-event-card-top">
                          <span className="my-event-category">
                            {registration.category_name}
                          </span>

                          <span
                            className={`event-status ${
                              registration.registration_status === 'CONFIRMED'
                                ? 'registration-status-confirmed'
                                : registration.registration_status === 'WAITLISTED'
                                  ? 'registration-status-waitlisted'
                                  : 'registration-status-cancelled'
                            }`}
                          >
                            {registration.registration_status === 'CONFIRMED'
                              ? 'Potrjena prijava'
                              : registration.registration_status === 'WAITLISTED'
                                ? 'Čakalni seznam'
                                : 'Odpovedana'}
                          </span>
                        </div>

                        <h2>{registration.title}</h2>

                        {registration.description && (
                          <p className="my-event-description">
                            {registration.description}
                          </p>
                        )}

                        <div className="my-event-details">
                          <div>
                            <span className="event-detail-label">
                              Lokacija
                            </span>
                            <span>{registration.location}</span>
                          </div>

                          <div>
                            <span className="event-detail-label">
                              Začetek dogodka
                            </span>
                            <span>
                              {formatDate(registration.start_date)}
                            </span>
                          </div>

                          <div>
                            <span className="event-detail-label">
                              Konec dogodka
                            </span>
                            <span>
                              {formatDate(registration.end_date)}
                            </span>
                          </div>

                          <div>
                            <span className="event-detail-label">
                              Organizator
                            </span>
                            <span>{registration.organization_name}</span>
                          </div>

                          <div>
                            <span className="event-detail-label">
                              Datum prijave
                            </span>
                            <span>
                              {formatDate(registration.registration_date)}
                            </span>
                          </div>
                        </div>

                        {(registration.registration_status === 'CONFIRMED' ||
                          registration.registration_status === 'WAITLISTED') && (
                          <button
                            className="button button-outline cancel-registration-button"
                            onClick={() =>
                              handleCancelRegistration(registration)
                            }
                            disabled={
                              cancellingRegistrationId ===
                              registration.registration_id
                            }
                          >
                            {cancellingRegistrationId ===
                            registration.registration_id
                              ? 'Odpovedovanje ...'
                              : 'Odpovej prijavo'}
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                <button
                  className="back-link"
                  onClick={() => setOrganizerView('home')}
                >
                  ← Nazaj na začetno stran
                </button>
              </div>
            ) : organizerView === 'eventRegistrations' && isOrganizer ? (
              <div className="my-events-panel event-registrations-panel">
                <span className="section-label">PREGLED DOGODKA</span>

                <h1>
                  Prijave <span>udeležencev.</span>
                </h1>

                <p className="form-description">
                  Pregled vseh udeležencev, ki so se prijavili na izbrani dogodek.
                </p>

                {selectedEvent && (
                  <div className="event-registrations-heading">
                    <h2>{selectedEvent.title}</h2>
                    <p>{selectedEvent.location}</p>
                  </div>
                )}

                {eventRegistrationsLoading ? (
                  <div className="events-info">
                    Nalaganje prijav ...
                  </div>
                ) : eventRegistrationsError ? (
                  <div className="events-empty">
                    <h2>Prijav ni bilo mogoče naložiti.</h2>
                    <p>{eventRegistrationsMessage}</p>

                    <button
                      className="button button-primary"
                      onClick={() =>
                        selectedEvent && loadEventRegistrations(selectedEvent)
                      }
                    >
                      Poskusi znova
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="registration-count-grid">
                      <div className="registration-count-card">
                        <span>Potrjene prijave</span>
                        <strong>
                          {eventRegistrationCounts.confirmed_count}
                        </strong>
                      </div>

                      <div className="registration-count-card">
                        <span>Čakalni seznam</span>
                        <strong>
                          {eventRegistrationCounts.waitlisted_count}
                        </strong>
                      </div>

                      <div className="registration-count-card">
                        <span>Odpovedane prijave</span>
                        <strong>
                          {eventRegistrationCounts.cancelled_count}
                        </strong>
                      </div>
                    </div>

                    {eventRegistrations.length === 0 ? (
                      <div className="events-empty">
                        <div className="events-empty-icon">✳</div>
                        <h2>Še ni prijavljenih udeležencev.</h2>
                        <p>
                          Ko se udeleženci prijavijo na dogodek, se bodo prikazali tukaj.
                        </p>
                      </div>
                    ) : (
                      <div className="event-registrations-list">
                        {eventRegistrations.map(registration => (
                          <article
                            className="event-registration-card"
                            key={registration.registration_id}
                          >
                            <div className="event-registration-person">
                              <div className="event-registration-avatar">
                                {registration.first_name?.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <h3>
                                  {registration.first_name} {registration.last_name}
                                </h3>
                                <p>{registration.email}</p>
                              </div>
                            </div>

                            <div className="event-registration-details">
                              <span className="event-detail-label">
                                Datum prijave
                              </span>
                              <span>
                                {formatDate(registration.registration_date)}
                              </span>
                            </div>

                            <span
                              className={`event-status ${
                                registration.registration_status === 'CONFIRMED'
                                  ? 'registration-status-confirmed'
                                  : registration.registration_status === 'WAITLISTED'
                                    ? 'registration-status-waitlisted'
                                    : 'registration-status-cancelled'
                              }`}
                            >
                              {registration.registration_status === 'CONFIRMED'
                                ? 'Potrjena'
                                : registration.registration_status === 'WAITLISTED'
                                  ? 'Čakalni seznam'
                                  : 'Odpovedana'}
                            </span>
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <button
                  className="back-link"
                  onClick={() => {
                    setOrganizerView('myEvents')
                    loadMyEvents()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ← Nazaj na moje dogodke
                </button>
              </div>
            ) : organizerView === 'myEvents' && isOrganizer ? (
              <div className="my-events-panel">
                <span className="section-label">ORGANIZACIJA</span>

                <h1>
                  Moji <span>dogodki.</span>
                </h1>

                <p className="form-description">
                  Tukaj lahko spremljaš svoje ustvarjene dogodke in objaviš
                  tiste, ki so pripravljeni.
                </p>

                {eventsMessage && (
                  <div
                    className={`form-message ${
                      eventsError ? 'form-error' : 'form-success'
                    }`}
                  >
                    {eventsMessage}
                  </div>
                )}

                {eventsLoading ? (
                  <div className="events-info">
                    Nalaganje dogodkov ...
                  </div>
                ) : eventsError ? (
                  <div className="events-empty">
                    <h2>Dogodkov ni bilo mogoče naložiti.</h2>
                    <p>{eventsMessage}</p>
                    <button
                      className="button button-primary"
                      onClick={loadMyEvents}
                    >
                      Poskusi znova
                    </button>
                  </div>
                ) : myEvents.length === 0 ? (
                  <div className="events-empty">
                    <div className="events-empty-icon">✳</div>
                    <h2>Še nimaš dogodkov.</h2>
                    <p>
                      Ko ustvariš svoj prvi dogodek, se bo prikazal tukaj.
                    </p>

                    <button
                      className="button button-primary"
                      onClick={() => setOrganizerView('create')}
                    >
                      Ustvari dogodek
                    </button>
                  </div>
                ) : (
                  <div className="my-events-list">
                    {myEvents.map(event => (
                      <article className="my-event-card" key={event.id}>
                        <div className="my-event-card-top">
                          <span className="my-event-category">
                            {event.category_name}
                          </span>

                          <span
                            className={`event-status ${
                              event.status === 'PUBLISHED'
                                ? 'event-status-published'
                                : 'event-status-draft'
                            }`}
                          >
                            {event.status === 'PUBLISHED'
                              ? 'Objavljeno'
                              : event.status === 'DRAFT'
                                ? 'Osnutek'
                                : event.status}
                          </span>
                        </div>

                        <h2>{event.title}</h2>

                        {event.description && (
                          <p className="my-event-description">
                            {event.description}
                          </p>
                        )}

                        <div className="my-event-details">
                          <div>
                            <span className="event-detail-label">
                              Lokacija
                            </span>
                            <span>{event.location}</span>
                          </div>

                          <div>
                            <span className="event-detail-label">
                              Začetek dogodka
                            </span>
                            <span>{formatDate(event.start_date)}</span>
                          </div>

                          <div>
                            <span className="event-detail-label">
                              Konec dogodka
                            </span>
                            <span>{formatDate(event.end_date)}</span>
                          </div>

                          <div>
                            <span className="event-detail-label">
                              Rok za prijavo
                            </span>
                            <span>
                              {formatDate(event.registration_deadline)}
                            </span>
                          </div>

                          <div>
                            <span className="event-detail-label">
                              Največje število udeležencev
                            </span>
                            <span>{event.max_participants}</span>
                          </div>
                        </div>

                        <button
                          className="button button-primary event-registrations-button"
                          onClick={() => handleOpenEventRegistrations(event)}
                        >
                          Pregled prijav
                        </button>

                        {event.status === 'DRAFT' && (
                          <button
                            className="button button-primary publish-button"
                            onClick={() => handlePublishEvent(event.id)}
                            disabled={publishingEventId === event.id}
                          >
                            {publishingEventId === event.id
                              ? 'Objavljanje ...'
                              : 'Objavi dogodek'}
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                <button
                  className="back-link"
                  onClick={() => setOrganizerView('home')}
                >
                  ← Nazaj na začetno stran
                </button>
              </div>
            ) : isOrganizer && organizerView === 'create' ? (
              <div className="event-form-panel">
                <span className="section-label">NOV DOGODEK</span>

                <h1>
                  Ustvari <span>dogodek.</span>
                </h1>

                <p className="form-description">
                  Izpolni podatke o dogodku. Dogodek bo najprej shranjen
                  kot osnutek, ki ga lahko pozneje objaviš.
                </p>

                <form
                  className="event-form"
                  onSubmit={handleEventSubmit}
                >
                  <div className="event-form-grid">
                    <div className="event-field event-field-full">
                      <label htmlFor="event-title">
                        Naziv dogodka
                      </label>

                      <input
                        id="event-title"
                        name="title"
                        type="text"
                        maxLength={255}
                        placeholder="Npr. Poletni glasbeni večer"
                        value={eventForm.title}
                        onChange={handleEventFormChange}
                        required
                      />
                    </div>

                    <div className="event-field event-field-full">
                      <label htmlFor="event-description">
                        Opis dogodka
                      </label>

                      <textarea
                        id="event-description"
                        name="description"
                        placeholder="Opiši dogodek ..."
                        value={eventForm.description}
                        onChange={handleEventFormChange}
                        rows={3}
                      />
                    </div>

                    <div className="event-field event-field-full">
                      <label htmlFor="event-location">
                        Lokacija
                      </label>

                      <input
                        id="event-location"
                        name="location"
                        type="text"
                        maxLength={255}
                        placeholder="Npr. Maribor"
                        value={eventForm.location}
                        onChange={handleEventFormChange}
                        required
                      />
                    </div>

                    <div className="event-field">
                      <label htmlFor="event-start">
                        Začetek dogodka
                      </label>

                      <input
                        id="event-start"
                        name="startDate"
                        type="datetime-local"
                        value={eventForm.startDate}
                        onChange={handleEventFormChange}
                        required
                      />
                    </div>

                    <div className="event-field">
                      <label htmlFor="event-end">
                        Konec dogodka
                      </label>

                      <input
                        id="event-end"
                        name="endDate"
                        type="datetime-local"
                        value={eventForm.endDate}
                        onChange={handleEventFormChange}
                        required
                      />
                    </div>

                    <div className="event-field">
                      <label htmlFor="event-deadline">
                        Rok za prijavo
                      </label>

                      <input
                        id="event-deadline"
                        name="registrationDeadline"
                        type="datetime-local"
                        value={eventForm.registrationDeadline}
                        onChange={handleEventFormChange}
                        required
                      />
                    </div>

                    <div className="event-field">
                      <label htmlFor="event-max">
                        Največje število udeležencev
                      </label>

                      <input
                        id="event-max"
                        name="maxParticipants"
                        type="number"
                        min="1"
                        placeholder="Npr. 100"
                        value={eventForm.maxParticipants}
                        onChange={handleEventFormChange}
                        required
                      />
                    </div>

                    <div className="event-field event-field-full">
                      <label htmlFor="event-category">
                        Kategorija
                      </label>

                      <select
                        id="event-category"
                        name="categoryId"
                        value={eventForm.categoryId}
                        onChange={handleEventFormChange}
                        required
                      >
                        <option value="">Izberi kategorijo</option>
                        <option value="1">Koncerti</option>
                        <option value="2">Šport</option>
                        <option value="3">Izobraževanje</option>
                        <option value="4">Kultura</option>
                        <option value="5">Drugo</option>
                      </select>
                    </div>
                  </div>

                  <button
                    className="button button-primary button-large form-submit"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Shranjevanje ...' : 'Shrani osnutek'}
                  </button>
                </form>

                {eventMessage && (
                  <div
                    className={`form-message ${
                      eventError ? 'form-error' : 'form-success'
                    }`}
                  >
                    {eventMessage}
                  </div>
                )}

                <button
                  className="back-link"
                  onClick={() => {
                    setOrganizerView('home')
                    setEventMessage('')
                    setEventError(false)
                  }}
                >
                  ← Nazaj na začetno stran
                </button>
              </div>
            ) : registrationView === 'closed' ? (
              <>
                <div className="eyebrow">
                  <span className="eyebrow-dot"></span>
                  TVOJ PROSTOR ZA DOGODKE
                </div>

                <h1>
                  Dogodki, ki<br />
                  <span>povezujejo.</span>
                </h1>

                <p className="hero-description">
                  Odkrij zanimive dogodke, spoznaj nove ljudi in ustvari
                  nepozabne trenutke. Vse na enem mestu.
                </p>

                <div className="hero-actions">
                  {!isAuthenticated ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <button
                        className="button button-primary button-large"
                        onClick={() => handleOpenDiscover()}
                      >
                        Odkrij dogodke <span>→</span>
                      </button>

                      {isOrganizer ? (
                        <button
                          className="button button-outline button-large"
                          onClick={() => {
                            setOrganizerView('create')
                            setRegistrationView('closed')
                            setEventMessage('')
                            setEventError(false)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          Ustvari dogodek
                        </button>
                      ) : isParticipant ? (
                        <button
                          className="button button-outline button-large"
                          onClick={handleOpenMyRegistrations}
                        >
                          Moje prijave
                        </button>
                      ) : null}
                    </>
                  )}
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
                  <label htmlFor="organization-name">
                    Ime organizacije
                  </label>

                  <input
                    id="organization-name"
                    name="name"
                    type="text"
                    placeholder="Vnesi ime organizacije"
                    value={organizationForm.name}
                    onChange={handleOrganizationFormChange}
                    required
                  />

                  <label htmlFor="organization-email">
                    E-poštni naslov
                  </label>

                  <input
                    id="organization-email"
                    name="email"
                    type="email"
                    placeholder="ime@organizacija.si"
                    value={organizationForm.email}
                    onChange={handleOrganizationFormChange}
                    required
                  />

                  <label htmlFor="organization-password">
                    Geslo
                  </label>

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

        {registrationView === 'closed' && organizerView === 'home' && (
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
              <article
                className="feature-card feature-card-clickable"
                onClick={() => handleOpenDiscover()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleOpenDiscover()
                  }
                }}
              >
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

      {registrationView === 'closed' && organizerView === 'home' && (
        <footer className="footer">
          <a
            href="#"
            className="brand footer-brand"
            onClick={(event) => {
              event.preventDefault()
              setOrganizerView('home')
            }}
          >
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
