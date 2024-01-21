import React from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

const ErrorPage: React.FC = () => {
  const router = useRouter();
  const {message} = router.query;

  const displayErrorMessage =
    message || 'Something went wrong, please try again later';

  return (
    <div>
      <h1>Error</h1>
      <p>{displayErrorMessage}</p>

      <Link href={'/'}> Go to home page</Link>
    </div>
  );
};

export default ErrorPage;
