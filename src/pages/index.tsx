import React from 'react';
import {Button, Container, Grid, Typography} from '@mui/material';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        style={{minHeight: '100vh'}}
      >
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Welcome to Our Website!
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Link href="/user/login" passHref>
            <Button variant="contained" color="primary">
              Sign In
            </Button>
          </Link>
        </Grid>
        <Grid item xs={12}>
          <Link href="/user/register" passHref>
            <Button variant="contained" color="secondary">
              Sign Up
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LandingPage;
