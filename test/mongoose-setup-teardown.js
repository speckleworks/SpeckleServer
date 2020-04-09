/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const mongoose = require( 'mongoose' );
const { MongoMemoryServer } = require( 'mongodb-memory-server' );

let mongoServer;

before( async () => {
  mongoose.Promise = global.Promise
  mongoose.set( 'useCreateIndex', true );
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect( mongoUri, {
    useNewUrlParser: true,
  } );
} )

after( async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
} )