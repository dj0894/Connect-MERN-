const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');


const connectDB = async () => {
    try {

        await mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });//awaits for connecting with db

        console.log('MONGO db connected');

    } catch (err) {
        console.error(err.message);
        //exit in case of failure
        process.exit(1);
    }
}

module.exports = connectDB;
