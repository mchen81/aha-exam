/**
 * @fileoverview Implementaion of the login form on the login page
 */

import React from 'react';
import {useForm, Controller} from 'react-hook-form';
import Link from 'next/link';
import {TextField, Button, Grid, Typography, Stack} from '@mui/material';
import {useAuth} from '@/hooks/useAuth';
import {toast} from 'react-toastify';

interface FormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const {control, handleSubmit} = useForm<FormValues>();
  const auth = useAuth();

  const onSubmit = async (data: FormValues): Promise<void> => {
    if (data.email === '' || data.password === '') {
      toast.error('Please fill in all fields');
      return;
    }

    await auth.login(
      {
        email: data.email,
        password: data.password,
      },
      (err: Error) => {
        toast.error(err.message);
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({field}) => (
              <TextField
                {...field}
                label="Email"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({field}) => (
              <TextField
                {...field}
                type="password"
                label="Password"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction={'row'} spacing={2}>
            <Button type="submit" variant="contained" color="primary">
              Sign In
            </Button>

            <Link href="/api/auth/google/auth">
              <Button variant="contained">Google Sign In</Button>
            </Link>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            {"Don't have an account?"}
            <Link href="/user/register">Register here</Link>
          </Typography>
        </Grid>
      </Grid>
    </form>
  );
};

export default LoginForm;
