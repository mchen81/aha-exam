import React from 'react'
import LoginForm from '@/components/LoginForm'
import { Container } from '@mui/material'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/router'

const LoginPage: React.FC = () => {
  const auth = useAuth()
  const router = useRouter()

  if (auth.user !== null && auth.user.isVerified) {
    void router.replace('/app/dashboard')
  }

  return (
    <Container maxWidth="sm">
      <LoginForm/>
    </Container>
  )
}

export default LoginPage
