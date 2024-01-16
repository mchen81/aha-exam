import React from 'react';
import {Container} from '@mui/material';
import RegistrationForm from '@/components/RegistrationForm';

const Register: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <RegistrationForm />
    </Container>
  );
};

export default Register;
