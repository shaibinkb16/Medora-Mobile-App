// config/db.js
const mongoose = require('mongoose');
const createAgenda = require('../workers/agendaSetup');

let agendaInstance;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize Agenda after successful connection
    agendaInstance = createAgenda(process.env.MONGO_URI);
    return agendaInstance;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getAgenda = () => {
  if (!agendaInstance) {
    throw new Error('Agenda not initialized. Call connectDB() first.');
  }
  return agendaInstance;
};

module.exports = {
  connectDB,
  getAgenda
};