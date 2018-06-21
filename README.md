# graphql-sequelize-helper
graphql-sequelize-helper transform Sequelize models to GraphQL schemas that is compatible with Relay.
* <a href="http://docs.sequelizejs.com/">Sequelize</a> is a promise-based Node.js ORM for Postgres, MySQL, SQLite and Microsoft SQL Server. It features solid transaction support, relations, read replication and more.
* <a href="https://graphql.org">GraphQL</a> is a query language for APIs and a runtime for fulfilling those queries with your existing data. GraphQL provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools.

### Install
* npm install graphql-sequelize-helper
* yarn add graphql-sequelize-helper

### Useage & Demo
```js
// define sequelize model
import gsh from 'graphql-sequelize-helper'

const UserType = gsh.modelRef('User')

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(25),
      unique: true,
      comment: 'name of the user...',
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING(25),
      field: 'phone_number',  // db field name
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(64),
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: 'Invalid email',
        },
      },
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [5, 100],
          msg: 'The password needs to be between 5 and 100 characters long',
        },
        // custom validate
        startWithLetter: (value) => {
          if(/^[a-z, A-A]/.test(value) === false) throw new Error('password must start with a letter')
        }
      },
    },
  }, {
    hooks: {
      afterValidate: async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        // eslint-disable-next-line no-param-reassign
        user.password = hashedPassword;
      },
    }
  })
  
  // build association
  User.associate = (models) => {
    User.hasMany(models.Order, {
      foreignKey: {
        name: 'userId',   // graphql field
        field: 'user_id'  // db field
      },
      hooks: true,
      onDelete: 'CASCADE'
    })
  }
  
  // some config
  User.config = {
    description: 'user model',   // graphql description,
    crud: {
      update: false
    }
  }
  
  // build custom queries, mutations, subscriptions, model methods, static methods
  User.graphql = {
    methods: {},
    statics: {},
    queries: {},
    mutations: {
      updateUser: {
        description: 'set the password',
        inputFields: {
          id: {
            $type: UserType,
            required: true
          },
          password: {
            $type: String,
            required: true,
            description: 'password...'
          }
        },
        outputFields: {
          changedUser: UserType
        },
        mutateAndGetPayload: async (args, context, info) => {
          const { User } = context.models
          const user = await User.findById(args.id)
          if (user === null) throw new Error('no user found')
          delete args.id

          if (user) {
            await user.update(args)
          }

          return {
            changedUser: user
          }
        }
      },
    },
    links: {}
  }
}
```
full demo see <a href="https://github.com/j-colter/graphql-microservice">https://github.com/j-colter/graphql-microservice</a>
