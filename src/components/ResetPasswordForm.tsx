/**
 * @fileoverview Reset password form component
 */

import React from 'react';
import {Grid, Typography, Button, Stack} from '@mui/material';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import {useForm, Controller} from 'react-hook-form';
import axios from 'axios';
import {toast} from 'react-toastify';

const schema = yup.object().shape({
  oldPassword: yup.string().required('oldPassword is required'),
  newPassword: yup
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
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

interface FormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Props {
  onSubmit?: () => void;
  onCancel?: () => void;
}

const ResetPasswordForm = (props: Props) => {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormValues): Promise<void> => {
    await axios
      .post('/api/user/reset-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
      .then(() => {
        toast.success('Password reset successfully');
        props.onSubmit?.();
      })
      .catch(err => {
        toast.error(err.response.data.error);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} spacing={3}>
          <Typography variant="h5" gutterBottom>
            Reset Password
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="oldPassword"
            control={control}
            defaultValue=""
            render={({field}) => (
              <TextField
                {...field}
                type="password"
                label="oldPassword"
                variant="outlined"
                fullWidth
                error={!_.isEmpty(errors.oldPassword)}
                helperText={errors.oldPassword?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="newPassword"
            control={control}
            defaultValue=""
            render={({field}) => (
              <TextField
                {...field}
                type="password"
                label="New Password"
                variant="outlined"
                fullWidth
                error={!_.isEmpty(errors.newPassword)}
                helperText={errors.newPassword?.message}
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
            <Button
              variant="outlined"
              color="error"
              onClick={() => props.onCancel && props.onCancel()}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Confirmed
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default ResetPasswordForm;
