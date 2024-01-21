import React, {useEffect, useState} from 'react';
import {Button, Container, Grid, Typography, Stack} from '@mui/material';
import {useAuth} from '@/hooks/useAuth';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  const auth = useAuth();
  const [isUserLogined, setIsUserLogined] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsUserLogined(false);
    await auth.logout(true);
  };

  useEffect(() => {
    if (auth.user !== null) {
      setIsUserLogined(true);
    }
  }, [auth]);

  return (
    <Container maxWidth="sm">
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Welcome to My Website!
          </Typography>
        </Grid>

        {isUserLogined ? (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Hello {auth?.user?.username}! <br />
              <Link href="/app/dashboard"> Go to dashboard</Link>
            </Typography>
            <Button variant="contained" onClick={handleLogout}>
              Log out
            </Button>
          </Grid>
        ) : (
          <Stack spacing={2} direction="row">
            <Link href="/user/login" passHref>
              <Button variant="contained" color="primary">
                Sign In
              </Button>
            </Link>
            <Link href="/user/register" passHref>
              <Button variant="contained" color="secondary">
                Sign Up
              </Button>
            </Link>
          </Stack>
        )}
      </Grid>
    </Container>
  );
};

export default LandingPage;
