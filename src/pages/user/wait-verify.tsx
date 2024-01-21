import React, {useState} from 'react';
import {Container, Alert, Button, Typography} from '@mui/material';
import {useAuth} from '@/hooks/useAuth';
import {useRouter} from 'next/router';
import axios from 'axios';
import {toast} from 'react-toastify';

const WaitVerify: React.FC = () => {
  const router = useRouter();
  const auth = useAuth();
  const [resendEmail, setResendEmail] = useState<boolean>(false);

  const onResendClick = () => {
    setResendEmail(true);
    axios
      .post('/api/user/resend-verify-email')
      .then(() => toast.success('Verification email has been resent'))
      .catch(err => toast.error(err.response?.data?.error ?? err.message));
  };

  if (auth.user !== null && auth.user.isVerified) {
    router.replace('/app/dashboard');
    return <></>;
  } else if (auth.user !== null) {
    return (
      <Container maxWidth="sm">
        <Alert severity="info">
          Please check your email to verify your account.
        </Alert>
        <Typography>
          Not received the verification email?{' '}
          <Button
            disabled={resendEmail}
            variant="outlined"
            onClick={onResendClick}
          >
            {resendEmail ? 'Resent' : 'Resend'}
          </Button>
          <br />
          {resendEmail &&
            'We have sent you an verification email again, please also check the spam folder'}
        </Typography>
      </Container>
    );
  } else {
    return (
      <Container maxWidth="sm">
        <Alert severity="info">We have sent a email to you</Alert>
      </Container>
    );
  }
};

export default WaitVerify;
