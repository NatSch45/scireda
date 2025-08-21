import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { NetworksHomePage } from '../pages/NetworksHomePage'
import { NetworkWorkspacePage } from '../pages/NetworkWorkspacePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AppLayout } from './ui/AppLayout'
import { MePage } from '../pages/MePage'
import { ErrorBoundary } from '../components/ErrorBoundary'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'networks',
        element: (
          <ProtectedRoute>
            <NetworksHomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'network/:networkId',
        element: (
          <ProtectedRoute>
            <NetworkWorkspacePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'me',
        element: (
          <ProtectedRoute>
            <MePage />
          </ProtectedRoute>
        ),
      },
      // Catch-all route for 404
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}


