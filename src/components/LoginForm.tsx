import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import Link from 'next/link'
import { TextField, Button, Grid, Typography } from '@mui/material'
import { useAuth } from '@/hooks/useAuth'

interface FormValues {
  email: string
  password: string
}

const LoginForm: React.FC = () => {
  const { control, handleSubmit } = useForm<FormValues>()
  const auth = useAuth()

  const onSubmit = async (data: FormValues): Promise<void> => {
    await auth.login({
      email: data.email,
      password: data.password
    }, (err: Error) => {
      alert(err.message)
    })
  }

  const onGoogleSignIn = async (): Promise<void> => {
    await auth.googleAuth()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => (
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
            render={({ field }) => (
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
          <Button type="submit" variant="contained" color="primary">
            Sign In
          </Button>
          {/* Google Login Button (You need to implement this separately) */}
          <Button variant="contained" onClick={onGoogleSignIn}>
            Google Sign In
          </Button>
        </Grid>
        <Grid item xs={12}>

          <Typography variant="body2">
            { "Don't have an account?" }
            <Link href="/user/register">Register here</Link>
          </Typography>
        </Grid>
      </Grid>
    </form>
  )
}

export default LoginForm
