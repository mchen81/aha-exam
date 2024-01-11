import React from 'react'
import { Grid } from '@mui/material'
import Link from 'next/link'

const SignInPage: React.FC = () => {
  return (
    <Grid
      container
      height="100vh"
      alignItems="center"
      justifyContent="center"
      direction="column"
    >
      <h1>Click Button to Sign in </h1>

      <Link href="/api/auth/google/auth">Google Signin</Link>

    </Grid>
  )
}

export default SignInPage
