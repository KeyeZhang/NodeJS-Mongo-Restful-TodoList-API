// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var UserSchema = new mongoose.Schema({
    name: {
      type:String,
      trim: true
    },
    email:{
      type:String,
      trim: true
    },
    pendingTasks: {
      type: [String],
      default: [""]
    },
    dateCreated: {
      type: Date,
      default: Date.now
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Users', UserSchema);
