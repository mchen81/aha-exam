import {Sequelize, Options} from 'sequelize';

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const env = process.env.RUNTIME_ENV
const cloudSqlSocketPath = process.env.CLOUD_SQL_SOCKET_PATH;

const dbOption: Options = {
    database: 'postgres',
    username: dbUser,
    password: dbPassword,
    host: dbHost,
    dialect: 'postgres',
}

if (env === 'cloud_run') {
    dbOption.dialectOptions = {
        socketPath: cloudSqlSocketPath,
    }
}

const sequelize = new Sequelize(dbOption);

if (env === 'cloud_run') {
    sequelize
        .authenticate()
        .then(() => {
            console.log("cloud sql connection has been established successfully.");
        })
        .catch((err) => {
            console.error("Unable to connect to the cloud sql database:", err);
        });
}

export default sequelize;
