/**
 * @fileoverview Implementaion of the user registeration form
 */

import React from 'react';
import {useForm, Controller} from 'react-hook-form';
import {TextField, Button, Grid, Stack} from '@mui/material';
import Link from 'next/link';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import _ from 'lodash';
import {useAuth} from '@/hooks/useAuth';
import {toast} from 'react-toastify';

const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one special character (!@#$%^&*)'
    ),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const RegistrationForm: React.FC = () => {
  const auth = useAuth();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormValues): Promise<void> => {
    await auth.register(
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
                error={!_.isEmpty(errors.email)}
                helperText={errors.email?.message}
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
                error={!_.isEmpty(errors.password)}
                helperText={errors.password?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="confirmPassword"
            control={control}
            defaultValue=""
            render={({field}) => (
              <TextField
                {...field}
                type="password"
                label="Confirm Password"
                variant="outlined"
                fullWidth
                error={!_.isEmpty(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction={'row'} spacing={2}>
            <Button type="submit" variant="contained" color="primary">
              Register
            </Button>

            <Link href="/api/auth/google/auth">
              <Button variant="contained">Google Sign Up</Button>
            </Link>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default RegistrationForm;
