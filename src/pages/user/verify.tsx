import type {
  InferGetServerSidePropsType,
  GetServerSideProps,
  NextApiResponse,
} from 'next';
import {Container, Alert, Typography} from '@mui/material';
import {verifyEmailVerificationToken} from '@/lib/util/jwt';
import UserAuthService from '@/lib/service/UserAuthService';
import ApplicationError from '@/lib/service/ApplicationError';
import Link from 'next/link';
import {setCookieForSession} from '@/util/http';
const userAuthService = UserAuthService.getInstance();

export default function Page({
  hasError,
  message,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (hasError) {
    return (
      <Container maxWidth="sm">
        We cannot verify your email address. Please try again later.
        <Alert severity="error">{message}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Alert severity="success">Your email address has been verified.</Alert>
      <br />
      <Link href="/user/login">
        <Typography>Go to Login Page</Typography>
      </Link>
    </Container>
  );
}

export const getServerSideProps = (async ({query, res}) => {
  const token = query.token;
  if (typeof token !== 'string') {
    return {
      props: {
        hasError: true,
        message: 'Invalid token',
      },
    };
  }

  let hasError = false;
  let message = 'SUCCESS';
  try {
    const payload = await verifyEmailVerificationToken(token);
    if (payload.email === undefined) {
      throw new Error('Invalid token');
    }
    const authedUser = await userAuthService.verifyUserEmail(payload.email);
    const session = await userAuthService.createSessionForAuthenticatedUser(
      authedUser.id
    );
    setCookieForSession(res as NextApiResponse, session);
    return {
      props: {hasError, message},
      redirect: {
        permanent: false,
        destination: '/app/dashboard',
      },
    };
  } catch (err) {
    hasError = true;
    if (err instanceof ApplicationError) {
      message = err.message;
    } else {
      console.error(err);
      message =
        'An error occurs while verifying the token, please contact the administrator';
    }
  }

  return {props: {hasError, message}};
}) satisfies GetServerSideProps<{hasError: boolean; message: string}>;
