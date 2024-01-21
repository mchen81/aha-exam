import React, {useEffect, useState} from 'react';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import AuthGuard from '@/components/AuthGuard';
import Loading from '@/components/Loading';
import NavBar from '@/components/NavBar';
import ResetPasswordForm from '@/components/ResetPasswordForm';
import EditProfileForm from '@/components/EditProfileForm';

import {useAuth} from '@/hooks/useAuth';

const Dashboard: React.FC = () => {
  const [resetPassword, setResetPassword] = useState(false);

  const auth = useAuth();
  useEffect(() => {}, []);

  return (
    <AuthGuard fallback={<Loading />}>
      <NavBar />
      <Container maxWidth="sm">
        <Stack spacing={5} justifyContent="flex-end" alignItems="flex-end">
          <EditProfileForm />

          {auth.user?.provider === 'local' &&
            (resetPassword ? (
              <ResetPasswordForm
                onCancel={() => setResetPassword(false)}
                onSubmit={() => setResetPassword(false)}
              />
            ) : (
              <Button
                variant={'outlined'}
                onClick={() => setResetPassword(true)}
              >
                Reset Password
              </Button>
            ))}

          <Button
            variant={'contained'}
            color="error"
            onClick={() => auth.logout()}
          >
            logout
          </Button>
        </Stack>
      </Container>
    </AuthGuard>
  );
};

export default Dashboard;
