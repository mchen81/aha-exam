import React from 'react';
import {Container, Grid, Typography, Button} from '@mui/material';
import AuthGuard from '@/components/AuthGuard';
import Loading from '@/components/Loading';
import {useAuth} from '@/hooks/useAuth';

const Dashboard: React.FC = () => {
  const auth = useAuth();

  return (
    <AuthGuard fallback={<Loading />}>
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
              I am dashboard!
            </Typography>

            <Button
              variant={'outlined'}
              onClick={async () => {
                await auth.logout();
              }}
            >
              logout
            </Button>
          </Grid>
        </Grid>
      </Container>
    </AuthGuard>
  );
};

export default Dashboard;
