import { useLogin, useRegister, useMe, useLogout } from '../../lib/api-hooks'
import { useAuthStore } from '../../app/store'
import { syncApiClientToken } from '../../lib/api-client-generated'
import { useEffect } from 'react'

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const storedUser = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const meQuery = useMe({
    queryKey: ['me'],
    enabled: !!token && !storedUser, // Only fetch if we have token but no stored user
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const loginMutation = useLogin({
    onSuccess: (data) => setAuth({ token: data.token, user: data.user }),
  })

  const logoutMutation = useLogout({
    onSettled: () => clearAuth(),
  })

  const registerMutation = useRegister({
    onSuccess: () => {
      // Note: Register endpoint doesn't return user data according to OpenAPI spec
      // You might need to login after registration
    },
  })

  // Sync token with API client whenever it changes
  useEffect(() => {
    syncApiClientToken(token);
  }, [token]);

  // Update stored user when fetched from /me endpoint
  useEffect(() => {
    if (meQuery.data && token && !storedUser) {
      setAuth({ token, user: meQuery.data });
    }
  }, [meQuery.data, token, storedUser, setAuth]);

  // Use stored user from login or fetched user from /me endpoint
  const user = storedUser || meQuery.data

  return {
    token,
    user,
    isLoadingUser: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
  }
}


