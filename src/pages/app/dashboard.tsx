import React from 'react';
import {Container} from '@mui/material';
import AuthGuard from '@/components/AuthGuard';
import Loading from '@/components/Loading';
import UserStatisticsTable from '@/components/UserStatisticsTable';
import AppBar from '@/components/AppBar';
import UserLoginDataTable from '@/components/UserDbDataTable';

const Dashboard: React.FC = () => {
  return (
    <AuthGuard fallback={<Loading />}>
      <AppBar>
        <Container>
          <UserStatisticsTable />
          <br />
          <UserLoginDataTable />
        </Container>
      </AppBar>
    </AuthGuard>
  );
};

export default Dashboard;
