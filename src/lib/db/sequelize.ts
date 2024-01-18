import {Sequelize, type Options} from 'sequelize';
import config from '@/util/config';

let dbOption: Options = {
  database: config.dbName,
  username: config.dbUser,
  password: config.dbPassword,
  host: config.dbHost,
  dialect: 'mysql',
};

if (config.runtimeEnv === 'cloud_run') {
  dbOption = {
    ...dbOption,
    dialectOptions: {
      socketPath: config.cloudSqlSocketPath,
    },
  };
}

const sequelize = new Sequelize(dbOption);

sequelize
  .authenticate()
  .then(() => {
    console.log('cloud sql connection has been established successfully.');
  })
  .catch(err => {
    console.error(
      `Unable to connect to the cloud sql with socket path ${config.cloudSqlSocketPath}:`,
      err
    );
  });

export default sequelize;
