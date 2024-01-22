/* eslint-disable @typescript-eslint/no-explicit-any */
import {GetStaticProps, InferGetStaticPropsType} from 'next';
import {createSwaggerSpec} from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic<{
  spec: any;
  //@ts-expect-error following the next-swagger-doc instruction, it works fine
}>(import('swagger-ui-react'), {ssr: false});

const schemas = {
  'login-result': {
    properties: {
      email: {type: 'string'},
      username: {type: 'string'},
      avatar: {type: 'string'},
      sessionToken: {type: 'string'},
      provider: {type: 'string'},
      isVerified: {type: 'boolean'},
    },
  },
  'user-account-info': {
    properties: {
      email: {type: 'string'},
      username: {type: 'string'},
      avatar: {type: 'string'},
      createdAt: {type: 'string'},
      isVerified: {type: 'boolean'},
      provider: {type: 'string'},
      lastLoginAt: {type: 'string'},
    },
  },
  'error-response': {
    properties: {
      error: {type: 'string'},
    },
  },
  'user-db-data': {
    properties: {
      email: {type: 'string'},
      signupTimestamp: {type: 'number'},
      loginCount: {type: 'number'},
      lastSessionTimestamp: {type: 'number'},
    },
  },
  'user-statistic': {
    properties: {
      userCount: {type: 'number'},
      activeUserToday: {type: 'number'},
      averageActiveSessionUsers: {type: 'number'},
    },
  },
};

function ApiDoc({spec}: InferGetStaticPropsType<typeof getStaticProps>) {
  return <SwaggerUI spec={spec} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
    apiFolder: 'src/pages/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'My Aha-exam API',
        version: '1.0',
      },
      produces: ['application/json'],
      components: {
        schemas,
      },
    },
  });

  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc;
