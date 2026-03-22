import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const loginMock = vi.fn();
const meMock = vi.fn();
const getStoredTokenMock = vi.fn();
const setStoredTokenMock = vi.fn();
const clearStoredTokenMock = vi.fn();

vi.mock('../lib/api', () => ({
  authApi: {
    login: (...args) => loginMock(...args),
    me: (...args) => meMock(...args),
  },
  getStoredToken: (...args) => getStoredTokenMock(...args),
  setStoredToken: (...args) => setStoredTokenMock(...args),
  clearStoredToken: (...args) => clearStoredTokenMock(...args),
}));

function Probe() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="loading">{String(isLoading)}</p>
      <p data-testid="authed">{String(isAuthenticated)}</p>
      <p data-testid="username">{user?.username ?? 'none'}</p>
      <button type="button" onClick={() => login('pw')}>login</button>
      <button type="button" onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws if useAuth is used outside provider', () => {
    const BadComponent = () => {
      useAuth();
      return <div>bad</div>;
    };

    expect(() => render(<BadComponent />)).toThrow('useAuth must be used inside AuthProvider');
  });

  it('starts unauthenticated when no token exists', async () => {
    getStoredTokenMock.mockReturnValue(null);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('authed')).toHaveTextContent('false');
    expect(meMock).not.toHaveBeenCalled();
  });

  it('hydrates authenticated user when token and /me succeed', async () => {
    getStoredTokenMock.mockReturnValue('token');
    meMock.mockResolvedValue({ username: 'facilitator', role: 'FACILITATOR' });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('authed')).toHaveTextContent('true');
    expect(screen.getByTestId('username')).toHaveTextContent('facilitator');
  });

  it('clears token when /me fails for a stored token', async () => {
    getStoredTokenMock.mockReturnValue('token');
    meMock.mockRejectedValue(new Error('expired'));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('authed')).toHaveTextContent('false');
    expect(clearStoredTokenMock).toHaveBeenCalled();
  });

  it('login stores token and logout clears auth state', async () => {
    getStoredTokenMock.mockReturnValue(null);
    loginMock.mockResolvedValue({ token: 'jwt', username: 'facilitator', role: 'FACILITATOR' });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => expect(screen.getByTestId('authed')).toHaveTextContent('true'));
    expect(setStoredTokenMock).toHaveBeenCalledWith('jwt');
    expect(screen.getByTestId('username')).toHaveTextContent('facilitator');

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    expect(clearStoredTokenMock).toHaveBeenCalled();
    expect(screen.getByTestId('authed')).toHaveTextContent('false');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
  });
});

