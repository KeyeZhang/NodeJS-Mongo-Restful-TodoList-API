// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var TasksSchema = new mongoose.Schema({
    name: {
      type:String,
      trim: true,
      unique: "Cannot use empty name."
    },
    description: String,
    deadline: {
      type:Date,
      trim:"Must have a deadline."
    },
    completed: {
      type:Boolean,
      default: false
    },
    assignedUser: {
      type: String,
      default: ""
    },
    assignedUserName: {
      type: String,
      default: "unassigned"
    },
    dateCreated: {
      type:Date,
      default: Date.now
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Tasks', TasksSchema);
