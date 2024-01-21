import React, {useEffect} from 'react';
import LoginForm from '@/components/LoginForm';
import {Container} from '@mui/material';
import {useAuth} from '@/hooks/useAuth';
import {useRouter} from 'next/router';

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.user !== null && auth.user.isVerified) {
      void router.replace('/app/dashboard');
    }
  }, [auth]);

  return (
    <Container maxWidth="sm">
      <LoginForm />
    </Container>
  );
};

export default LoginPage;
