// Get the packages we need
var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    secrets = require('./config/secrets'),
    bodyParser = require('body-parser'),
    Tasks = require('./models/tasks'),
    Users = require('./models/users'),
    {ObjectID} = require('mongodb');
// Create our Express application
var app = express();

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
// Connect to a MongoDB
mongoose.connect(secrets.mongo_connection, { useMongoClient: true});

// Allow CORS so that backend and frontend could be put on different servers
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Use routes as a module (see index.js)
require('./routes')(app, router);

// Why can't we use insertOne to insert seed data? Must use .sava()
// Users.insertOne({
//   name: 'Keye',
//   email: 'keye.zhang@yahoo.com',
//   pendingTasks: ['eat', 'sleep'],
//   dataCreated: 2017-10-10
// })

// insert seed data Must use .sava() ?
// var newuser = new Users({
//   name: 'Keye',
//   email: 'keye.zhang@yahoo.com',
//   pendingTasks: ['eat', 'sleep'],
//   dataCreated: 2017-10-10
// });

//newuser.save();

app.get("/api/users", (req, res) => {
  var result = {message: "", data:{}};
  // console.log(typeof (req.query.sort));
  var sort = (req.query.sort == undefined) ? undefined : JSON.parse(req.query.sort);
  var limit = (req.query.limit == undefined) ? undefined : parseInt(req.query.limit);
  var where = (req.query.where == undefined) ? undefined : JSON.parse(req.query.where);
  var select = (req.query.select == undefined) ? undefined : JSON.parse(req.query.select);
  var skip = (req.query.skip== undefined) ? undefined : parseInt(req.query.skip);
  var count = (req.query.count== undefined) ? undefined : JSON.parse(req.query.count);
  // console.log(typeof select);

  if(count == true){
    Users.find(
      where,
      select
    )
    .sort(sort)
    .skip(skip)
    .count(count)
    .limit(limit)
    .then((users) => {
      result.message = 'OK: Get the number of users!';
      result.data = users;
      return res.status(200).send(result);
    }, (err) => {
      result.message = 'There is a error for getting all the users.';
      return res.status(500).send(result);
    });
  }
  else{
      Users.find(
        where,
        select
      )
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .then((users) => {
        result.message = 'OK: Get users back!';
        result.data = users;
        return res.status(200).send(result);
      }, (err) => {
        result.message = 'There is a error for getting all the users.';
        return res.status(500).send(result);
      });
  }

});


app.post("/api/users", (req, res) => {
  var result = {message: "", data:{}};

  if((req.body.name == undefined || req.body.name == "") && (req.body.email == undefined || req.body.email == "")){
    result.message = "User's name and email could not both be empty!";
    return res.status(500).send(result);
  }
  //email not empty
  if(req.body.email){
    Users.findOne({
      email: req.body.email
    }).then((user) => {
      if(user != null){
        result.message = "Conflict: User with this email address already exist!";
        return res.status(409).send(result);
      }  //when to use catch, when to .then followed by two callbacks?

      var newuser = new Users({
          name: req.body.name,
          email: req.body.email,
          pendingTasks: req.body.pendingTasks,
          dateCreated: req.body.dateCreated
      });
      newuser.save().then((user) => {
        result.message = "OK: User saved successfully."
        result.data = user;
        return res.status(201).send(result);
      }, (err) => {
        result.message = "There is an error posting this user!";
        return res.status(500).send(result);
      });
    });
  }
  //email is empty, find by name
  else if(req.body.name){
    Users.findOne({
      name: req.body.name
    }).then((user) => {
      if(user != null){
        result.message = "Conflict: User with this email address already exist!";
        return res.status(409).send(result);
      }  //when to use catch, when to .then followed by two callbacks?

      var newuser = new Users({
          name: req.body.name,
          email: req.body.email,
          pendingTasks: req.body.pendingTasks,
          dateCreated: req.body.dateCreated
      });
      newuser.save().then((user) => {
        result.message = "OK: User saved successfully."
        result.data = user;
        return res.status(201).send(result);
      }, (err) => {
        result.message = "There is an error posting this user!";
        return res.status(500).send(result);
      });
    });
  }
});


app.get("/api/users/:id", (req, res) => {
  var id = req.params.id;
  var result = {message: "", data:{}};
  var select = (req.query.select == undefined) ? undefined : JSON.parse(req.query.select);

  if(!ObjectID.isValid(id)){
    result.message = "Invalid Id";
    return res.status(404).send(result);
  }

  Users.findById(id).
  select(select)
  .then((user) => {
    if(user == null){
      result.message =  "User not found!";
      return res.status(404).send(result);
    }
    result.message = ("OK: Successfully get the user.")
    result.data = user;
    return res.status(200).send(result);
  }, (err) => {
    result.message = "There is an error getting this user!";
    res.status(500).send(result);
  });
});

app.put("/api/users/:id", (req, res) => {
  var id = req.params.id;
  var result = {message: "", data:{}};

  if(!ObjectID.isValid(id)){
    result.message = "Invalid ID!";
    return res.status(404).send(result);
  }
  if((req.body.name == undefined || req.body.name == "") && (req.body.email == undefined || req.body.email == "")) {
    result.message = "User's name and email could not both be empty for updating!";
    return res.status(500).send(result);
  }

  Users.findOneAndUpdate(
    {"_id": id},
    {$set:
      req.body
    },
    {
      new: true
    }
  ).then((user) => {
    if(user == null){
      result.message = "User does not exist!";
      return res.status(404).send(result);
    }
    result.message = "OK: Update the user successfully";
    result.data = user;
    return res.status(200).send(result);
  })
  .catch((err) => {
    result.message = "There is an error getting this user!";
    return res.status(500).send(result);
  });
});


app.delete("/api/users/:id", (req, res) => {
  var id = req.params.id;
  var result = {message: "", data:{}};

  if(!ObjectID.isValid(id)){
    result.message = "Invalid ID!";
    return res.status(404).send(result);
  }

  Users.findByIdAndRemove(id).then((user) => {
    if(user == null){
      result.message = "User does not exist!";
      return res.status(404).send(result);
    }
    result.message = "OK: User deleted";
    result.data = user;
    return res.status(200).send(result);
  })
  .catch((err) => {
    result.message = "There is an error deleting the user";
    res.status(500).send(result);
  });

});

//
// name: String,
// description: String,
// deadline: Date,
// completed: Boolean,
// assignedUser: {
//   type: String,
//   default: ""
// },
// assignedUserName: {
//   type: String,
//   default: "unassigned"
// },
// dateCreated: Date

//Tasks
app.get("/api/tasks", (req, res) => {
  var result = {message: "", data:{}};
  var sort = (req.query.sort == undefined) ? undefined : JSON.parse(req.query.sort);
  var limit = (req.query.limit == undefined) ? undefined : parseInt(req.query.limit);
  var where = (req.query.where == undefined) ? undefined : JSON.parse(req.query.where);
  var select = (req.query.select == undefined) ? undefined : JSON.parse(req.query.select);
  var skip = (req.query.skip== undefined) ? undefined : parseInt(req.query.skip);
  var count = (req.query.count== undefined) ? undefined : JSON.parse(req.query.count);

  if(count == true){
    Tasks.find(where, select)
    .sort(sort)
    .skip(skip)
    .count(count)
    .limit(limit)
    .then((tasks) => {
      result.message = 'OK: Get the number of tasks!';
      result.data = tasks;
      return res.status(200).send(result);
    }, (err) => {
      result.message = 'There is a error for getting all the tasks.';
      return res.status(500).send(result);
    });
  }
  else{
    Tasks.find(where, select)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .then((tasks) => {
      result.message = 'OK: Get all tasks back!';
      result.data = tasks;
      return res.status(200).send(result);
    }, (err) => {
      result.message = 'There is a error for getting all the tasks.';
      return res.status(500).send(result);
    });
  }
});


app.post("/api/tasks", (req, res) => {
  var result = {message: "", data:{}};
  if((req.body.name == undefined || req.body.name == "")&& (req.body.deadline == undefined || req.body.deadline == "")) {
    result.message = "Task name and deadline could not both be empty!";
    return res.status(500).send(result);
  }

  if(req.body.name){
    Tasks.findOne({
      name: req.body.name
    }).then((task) => {
      if(task != null){
        result.message = "This task is already assigned to a person!";
        return res.status(409).send(result);
      }  //when to use catch, when to .then followed by two callbacks?

      var newtask = new Tasks({
        name: req.body.name,
        description: req.body.description,
        deadline: req.body.deadline,
        completed: req.body.completed,
        assignedUser: req.body.assignedUser,
        assignedUserName: req.body.assignedUserName,
        dateCreated: req.body.dateCreated
      });
      newtask.save().then((task) => {
        result.message = "OK: Task saved sucessfully.";
        result.data = task;
        res.status(201).send(result);
      }, (err) => {
        result.message = "There is an error posting the task!";
        res.status(500).send(result);
      });
    });
  }
  else if(req.body.deadline){
    Tasks.findOne({
      deadline: req.body.deadline
    }).then((task) => {
      if(task != null){
        result.message = "This task is already assigned to a person!";
        return res.status(409).send(result);
      }  //when to use catch, when to .then followed by two callbacks?

      var newtask = new Tasks({
        name: req.body.name,
        description: req.body.description,
        deadline: req.body.deadline,
        completed: req.body.completed,
        assignedUser: req.body.assignedUser,
        assignedUserName: req.body.assignedUserName,
        dateCreated: req.body.dateCreated
      });
      newtask.save().then((task) => {
        result.message = "OK: Task saved sucessfully.";
        result.data = task;
        res.status(201).send(result);
      }, (err) => {
        result.message = "There is an error posting the task!";
        res.status(500).send(result);
      });
    });
  }
});


app.get("/api/tasks/:id", (req, res) => {
  var id = req.params.id;
  var result = {message: "", data:{}};
  var select = (req.query.select == undefined) ? undefined : JSON.parse(req.query.select);

  if(!ObjectID.isValid(id)){
    result.message = "Invalid Id!";
    return res.status(404).send(result);
  }

  Tasks.findById(id)
  .select(select)
  .then((task) => {
    if(task == null){
      result.message = "Task not found.";
      return res.status(404).send(result);
    }
    result.message = "OK: Get the task back.";
    result.data = task;
    return res.status(200).send(result);
  }, (err) => {
    result.message = "There is an error getting the task."
    return res.status(500).send(result);
  });
});


app.put("/api/tasks/:id", (req, res) => {
  var id = req.params.id;
  var result = {message: "", data:{}};

  if(!ObjectID.isValid(id)){
    result.message = "Invalid ID!";
    return res.status(404).send(result);
  }
  if((req.body.name == undefined || req.body.name == "") && (req.body.deadline == undefined || req.body.deadline == "")) {
    result.message = "Task name and deadline could not both be empty!";
    return res.status(500).send(result);
  }


  Tasks.findOneAndUpdate(
    {"_id": id},
    {$set:
      req.body
    },
    {
      new: true
    }
  ).then((task) => {
    if(task == null){
      result.message = "Task does not exist!";
      return res.status(404).send(result);
    }
    result.message = "OK: Task updated.";
    result.data = task;
    return res.status(200).send(result);
  })
  .catch((err) => {
    result.message = "There is an error updating the task!"
    return res.status(500).send(result);
  });
});


app.delete("/api/tasks/:id", (req, res) => {
  var id = req.params.id;
  var result = {message: "", data:{}};

  if(!ObjectID.isValid(id)){
    result.message = "Invalid ID!";
    return res.status(404).send(result);
  }

  Tasks.findByIdAndRemove(id).then((task) => {
    if(task == null){
      result.message = "Task does not exist!";
      return res.status(404).send(result);
    }
    result.message = "OK: Task deleted";
    result.data = task;
    return res.status(200).send(result);
  })
  .catch((err) => {
    result.message = "There is an error deleting the task!"
    res.status(500).send(result);
  });
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
