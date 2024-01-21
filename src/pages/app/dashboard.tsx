import React from 'react';
import {Container} from '@mui/material';
import AuthGuard from '@/components/AuthGuard';
import Loading from '@/components/Loading';
import NavBar from '@/components/NavBar';
import UserStatisticsTable from '@/components/UserStatisticsTable';

const Dashboard: React.FC = () => {
  return (
    <AuthGuard fallback={<Loading />}>
      <NavBar />

      <Container>
        <UserStatisticsTable />
      </Container>
    </AuthGuard>
  );
};

export default Dashboard;
