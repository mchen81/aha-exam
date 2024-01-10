import { Sequelize } from 'sequelize';

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const sequelize = new Sequelize({
    database: 'postgres',
    username: dbUser,
    password: dbPassword,
    host: dbHost,
    dialect: 'postgres',
});

export default sequelize;
