import React, {useEffect, useState} from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import {type LoginInfo} from '@/types/user';

import axios from 'axios';

const UserLoginDataTable = () => {
  const [userLoginInfos, setUserLoginInfos] = useState<LoginInfo[]>([]);

  useEffect(() => {
    axios
      .post('/api/data/userLoginInfo')
      .then(res => {
        setUserLoginInfos(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  return (
    <TableContainer component={Paper} sx={{width: '100%'}}>
      <Table aria-label="User Login Table">
        <TableHead>
          <TableRow>
            <TableCell>User email</TableCell>
            <TableCell align="right">Sign up timestamp</TableCell>
            <TableCell align="right">Logged in times</TableCell>
            <TableCell align="right">Last session timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userLoginInfos.map(info => (
            <TableRow
              key={info.email}
              sx={{'&:last-child td, &:last-child th': {border: 0}}}
            >
              <TableCell component="th" scope="row">
                {info.email}
              </TableCell>
              <TableCell align="right">{info.signupTimestamp}</TableCell>
              <TableCell align="right">{info.loginCount}</TableCell>
              <TableCell align="right">{info.lastSessionTimestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserLoginDataTable;
