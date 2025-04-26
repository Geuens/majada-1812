require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Use the environment variables for connection
const sequelize = new Sequelize({
  host: process.env.POSTGRES_HOST,
  dialect: 'postgres',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,  // allow self-signed certificates
        },
  },
});

console.log('Environment Variables:', process.env);

sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });


const Comment = sequelize.define('comments', {
  commentId: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
    field: 'commentid',  // Explicitly specify the column name
  },
  articleId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'articleid',  // Explicitly specify the column name
  },
  articleType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'articletype',  // Explicitly specify the column name
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'parentid',  // Explicitly specify the column name
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'userid',  // Explicitly specify the column name
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'username',  // Explicitly specify the column name
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content',  // Explicitly specify the column name
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isdeleted',  // Explicitly specify the column name
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'createdat',  // Explicitly specify the column name
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updatedat',  // Explicitly specify the column name
  },
}, {
  timestamps: true,
  tableName: 'comments', // Ensure the table name is correctly mapped
});

Comment.sync({ alter: true })
  .then(() => {
    console.log('✅ Comments table synced.');
  })
  .catch((error) => {
    console.error('❌ Failed to sync Comments table:', error);
  });

module.exports = Comment;


