import { Sequelize } from 'sequelize';

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '<PASSWORD>';

const sequelize = new Sequelize({
    database: 'postgres',
    username: dbUser,
    password: dbPassword,
    host: dbHost,
    dialect: 'postgres',
});

export default sequelize;
