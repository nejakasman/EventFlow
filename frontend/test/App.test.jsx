import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import keycloak from '../src/keycloak'

vi.mock('../src/keycloak', () => ({
  default: {
    authenticated: false,
    token: undefined,
    tokenParsed: undefined,
    login: vi.fn(),
    register: vi.fn(),
  },
}))

const fetchMock = vi.fn()

beforeEach(() => {
  keycloak.authenticated = false
  keycloak.token = undefined
  keycloak.tokenParsed = undefined
  vi.clearAllMocks()
  fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => ({ events: [] }) })
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function openDiscover() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Odkrij dogodke' }))
}

function signInAs(role) {
  keycloak.authenticated = true
  keycloak.token = 'test-token'
  keycloak.tokenParsed = { given_name: 'Ana', realm_access: { roles: [role] } }
}

describe('Account navigation', () => {
  it('opens Keycloak login from the sign-in button', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Prijava' }))
    expect(keycloak.login).toHaveBeenCalledOnce()
  })

  it('opens Keycloak registration after choosing a participant account', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Registracija' }))
    fireEvent.click(screen.getByRole('button', { name: /udeleženec/i }))
    expect(keycloak.register).toHaveBeenCalledOnce()
  })

  it('opens account selection from the registration link and clears the query parameter', () => {
    window.history.replaceState({}, '', '/?registration=1')
    render(<App />)
    expect(screen.getByRole('button', { name: /udeleženec/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /organizacija/i })).toBeTruthy()
    expect(window.location.search).toBe('')
  })

  it('shows event management actions for organizers', () => {
    signInAs('ORGANIZER')
    render(<App />)
    const navbar = within(screen.getByRole('banner'))
    expect(navbar.getByRole('button', { name: 'Moji dogodki' })).toBeTruthy()
    expect(navbar.getByRole('button', { name: 'Ustvari dogodek' })).toBeTruthy()
    expect(navbar.queryByRole('button', { name: 'Moje prijave' })).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows participant registrations and syncs the profile with a bearer token', () => {
    signInAs('PARTICIPANT')
    render(<App />)
    const navbar = within(screen.getByRole('banner'))
    expect(navbar.getByRole('button', { name: 'Moje prijave' })).toBeTruthy()
    expect(navbar.queryByRole('button', { name: 'Ustvari dogodek' })).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/me',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    )
  })
})

describe('Event discovery', () => {
  it('renders a published event returned by the API', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        events: [{
          id: 42,
          title: 'Jazz večer',
          start_date: '2027-03-20T19:00:00Z',
          location: 'Maribor',
          category_id: 1,
          category_name: 'Koncerti',
          organization_name: 'Kulturno društvo',
        }],
      }),
    })

    openDiscover()

    expect(await screen.findByRole('heading', { name: 'Jazz večer' })).toBeTruthy()
    expect(screen.getByRole('article').textContent).toContain('Maribor')
    expect(screen.getByText('1 dogodek')).toBeTruthy()
  })

  it('sends trimmed search text, the category, and the date to the API', async () => {
    openDiscover()
    await screen.findByRole('heading', { name: 'Trenutno ni dogodkov.' })

    fireEvent.change(screen.getByLabelText('Išči dogodek'), { target: { value: '  Jazz & blues  ' } })
    fireEvent.change(screen.getByLabelText('Kategorija'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Datum dogodka'), { target: { value: '2027-03-20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Išči dogodke' }))
    await screen.findByRole('heading', { name: 'Trenutno ni dogodkov.' })

    const url = new URL(fetchMock.mock.lastCall[0])
    expect(url.pathname).toBe('/api/events')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      search: 'Jazz & blues',
      categoryId: '2',
      date: '2027-03-20',
    })
  })

  it('clears the filters and reloads the unfiltered list', async () => {
    openDiscover()
    await screen.findByRole('heading', { name: 'Trenutno ni dogodkov.' })

    const search = screen.getByLabelText('Išči dogodek')
    const category = screen.getByLabelText('Kategorija')
    const date = screen.getByLabelText('Datum dogodka')
    fireEvent.change(search, { target: { value: 'Jazz' } })
    fireEvent.change(category, { target: { value: '1' } })
    fireEvent.change(date, { target: { value: '2027-03-20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ponastavi' }))
    await screen.findByRole('heading', { name: 'Trenutno ni dogodkov.' })

    expect([search.value, category.value, date.value]).toEqual(['', '', ''])
    expect(new URL(fetchMock.mock.lastCall[0]).search).toBe('')
  })

  it('shows an error returned by the events API', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Pri pridobivanju dogodkov je prišlo do napake.' }),
    })

    openDiscover()

    expect(await screen.findByText('Pri pridobivanju dogodkov je prišlo do napake.')).toBeTruthy()
  })
})
