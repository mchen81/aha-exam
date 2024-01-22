import React, {useState} from 'react';

import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import AuthGuard from '@/components/AuthGuard';
import Loading from '@/components/Loading';
import ResetPasswordForm from '@/components/ResetPasswordForm';
import EditProfileForm from '@/components/EditProfileForm';
import AppBar from '@/components/AppBar';

import {useAuth} from '@/hooks/useAuth';

const Dashboard: React.FC = () => {
  const [resetPassword, setResetPassword] = useState(false);

  const auth = useAuth();

  return (
    <AuthGuard fallback={<Loading />}>
      <AppBar>
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
      </AppBar>
    </AuthGuard>
  );
};

export default Dashboard;
