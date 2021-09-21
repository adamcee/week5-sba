const express = require('express');
const mongoose = require('mongoose');

/***
 * TODO
 * x - create mongoose model
 * x - connect to db
 * x - create test data in db
 * x - start express app, 'hello word'
 * x - create GET /notes route
 *    x- actually get data 
 * 
 *  x- create GET /note/:id route
 *    x- actually get data 
 * 
 *  - create POST /note route
 *    - actually create note
 * 
 *  - create PUT /note route
 *    - actually update note
 */
/** Create and configure db, Model for db */
// Create our Mongoose Model
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  }
})

const NoteModel = mongoose.model('Note', noteSchema);

// db config
const DB_NAME = 'week5sba';
const DB_URL = `mongodb://localhost:27017/${DB_NAME}`;

console.log('MongoDB: Attempting to connect ...');

mongoose
  .connect(DB_URL)
  .then(() => console.log(`Connected to MongoDB ${DB_URL}`))
  .catch(error => console.log(`Failed to connectto DB: ${error}`));

// Now that we're connected to the db lets create test data
// const note1 = new NoteModel({ content: "Hello world" });
// note1
//   .save()
//   .catch(error => `ERROR saving note: ${error}`);

/** Create express server for our API */
const app = express();

// Parse json in request body for POST, PUT
app.use(express.json());


const PORT = 8888;

// Create routes for our express server

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}, params: ${req.params}`);
  next();
})

app.get('/', (req, res) => res.send('Hello world'));

app.get('/notes', (req, res) => {
  NoteModel
    .find()
    .then(notes => {
      console.log('all notes ', notes);
      res.send(notes);
    })
    .catch(error => res.status(400).send(`Unable to get notes. Error: ${error}`));
})

app.get('/note/:id', (req, res) => {
  const id = req.params.id;
  console.log('note id ', id);
  NoteModel
    .findById(id)
    .then(note => {
      console.log('note ', note);
      res.send(note);
    })
    .catch(error => res.status(400).send(`Error on ${req.method} ${req.path}: ${error}`));
})

/**
 *  - create POST /note route
 *    X- create route
 *    X- confirm we get data from POST body 
 *    X- write error message for when there is no data in note body
 *    X- write code to create new note
 *    X- actually create note
 */
app.post('/note', (req, res) => {
  const body = req.body;

  if(!body || !body.content) {
    res
      .status(400)
      .send(`Error, malformed POST body: ${JSON.stringify(body)}`)
  }

  const newNote = new NoteModel({ content: body.content });

  newNote
    .save()
    .then(data => res.send('Note created, ' + JSON.stringify(data)))
    .catch(error => {
      res
        .status(400)
        .send(`Error - unable to create note: ${error}`);
    });
});

/**
 * PUT /note/:id
 * 
 * X- create route
 * X- confirm we are getting PUT request body
 * X- create mongoose model
 * X- save to database and return success messsage
 */
app.put('/note/:id', (req, res) => {
  const body = req.body;
  const id = req.params.id;

  if (!body || !body.content) {
    res
      .status(400)  
      .send(`Error, bad body: ${body}`);
  }

  /***
  // This is another way to update the note.
  // Both this and the method used are equally valid
  // This approach is a bit nicer because we dont need the extra level of nesting
  // We just have to be sure we create the options object to get updated data back
  const options = { new: true};
  const updateInfo = { content: body.content };
  NoteModel
    .findByIdAndUpdate(id , updateInfo, options)
    .then(updatedNote => res.send(`Note updated: ${updatedNote}`))
    .catch(error => res.status(400).send(`Error updating: ${error}`));
  ***/

  // Get note from db if it exists
  NoteModel
    .findById(id)
    .then(note => {
      note.content = body.content;
      note
        .save()
        .then(data => res.send(`${data}`));
    })
    .catch(error => res.status(400).send(`Error updating: ${error}`));
});

/**
 * DELETE /note/:id
 * 
 * - create route
 * - get the note from the database
 * - successfully delete note and return message
 */
app.delete('/note/:id', (req, res) => {
  const id = req.params.id;
  
  NoteModel
    .findByIdAndDelete(id, {})
    .then(msg => res.send(`Successfully deleted ${msg}`))
    .catch(error => res.status(400).send(`Error deleting ${error}`));
});

// Start the server
app.listen(PORT, () => console.log('Express server started on port ' + PORT));