/**
 * @fileoverview A dashboard component that showing the user Statistics data
 */

import React, {useState, useEffect} from 'react';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import {toast} from 'react-toastify';

interface StatisticsData {
  userCount: number;
  activeUserToday: number;
  averageActiveSessionUsers: number;
}

const UserStatisticsTable = () => {
  const [data, setData] = useState<StatisticsData | null>(null);

  const fetchUserStatics = async () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() / 60;
    axios
      .get(`/api/data/userStatistics?offset=${offset}`)
      .then(res => {
        const resData = res.data as StatisticsData;
        resData.averageActiveSessionUsers =
          Math.round(resData.averageActiveSessionUsers * 1000) / 1000;

        setData(resData);
      })
      .catch(err => {
        toast.error(err.response.data.message);
      });
  };

  useEffect(() => {
    fetchUserStatics();
  }, []);

  return (
    <Stack spacing={2}>
      <div>
        {'Total number of users:'} {data?.userCount ?? 'loading'}
      </div>
      <div>
        {'Total number of users with active sessions today: '}
        {data?.activeUserToday ?? 'loading'}
      </div>
      <div>
        {'Average number of active session users in the last 7 days rolling: '}
        {data?.averageActiveSessionUsers ?? 'loading'}
      </div>
    </Stack>
  );
};

export default UserStatisticsTable;
