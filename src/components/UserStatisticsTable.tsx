import React from 'react';
import Stack from '@mui/material/Stack';

const UserStatisticsTable = () => {
  return (
    <Stack spacing={2}>
      <div>All User Counts: </div>
      <div>Active User (today)</div>
      <div>Average number of active session users in the last 7 days </div>
    </Stack>
  );
};

export default UserStatisticsTable;
