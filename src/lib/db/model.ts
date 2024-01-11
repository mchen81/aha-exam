import sequelize from './sequelize'
import {
  DataTypes,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  Model
} from 'sequelize'

type AuthenticationProvider = 'local' | 'google'

export class UserAccount extends Model<InferAttributes<UserAccount>, InferCreationAttributes<UserAccount>> {
  declare id: CreationOptional<number>
  declare email: string
  declare username: CreationOptional<string>
  declare avatar: CreationOptional<string>
  declare createdAt: Date
}

export class UserAuthentication extends Model<InferAttributes<UserAuthentication>, InferCreationAttributes<UserAuthentication>> {
  declare id: CreationOptional<number>
  declare userId: ForeignKey<number>
  declare provider: AuthenticationProvider
  declare authentication: string
  declare isVerified: boolean
  declare createdAt: Date
}

export class UserSession extends Model<InferAttributes<UserSession>, InferCreationAttributes<UserSession>> {
  declare id: CreationOptional<number>
  declare userId: ForeignKey<number>
  declare sessionToken: string
  declare isActive: boolean
  declare createdAt: Date
}

UserAccount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'UserAccount',
    tableName: 'user_account',
    timestamps: false,
    underscored: true
  }
)

UserAuthentication.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserAccount,
      key: 'id'
    }
  },
  provider: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  authentication: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'UserAuthentication',
  tableName: 'user_authentication',
  timestamps: false,
  underscored: true
})

UserSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserAccount,
        key: 'id'
      }
    },
    sessionToken: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'UserSession',
    tableName: 'user_session',
    timestamps: false,
    underscored: true
  }
)

UserAccount.hasMany(UserAuthentication, {
  foreignKey: 'userId',
  foreignKeyConstraint: true,
  onDelete: 'CASCADE'
})

UserAuthentication.belongsTo(UserAccount, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
})

UserAccount.hasMany(UserSession, {
  foreignKey: 'userId',
  foreignKeyConstraint: true,
  onDelete: 'CASCADE'
})

UserSession.belongsTo(UserAccount, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
})

async function syncDatabase (): Promise<void> {
  try {
    await sequelize.sync({ force: false })
    console.log('Database synchronized successfully')
  } catch (error) {
    console.error('Error synchronizing database:', error)
  }
}

void (async () => {
  try {
    await sequelize.authenticate()
    console.log('Connected to the database')
    await syncDatabase()
    // Start your Node.js application logic here
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
})()
