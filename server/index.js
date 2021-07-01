const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const port = 5000


var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.jumub.mongodb.net:27017,cluster0-shard-00-01.jumub.mongodb.net:27017,cluster0-shard-00-02.jumub.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-20e537-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use(express.static('doctors'));
app.use(fileUpload());



app.get('/', (req, res) => {
  res.send('Hello World!')
})




client.connect(err => {
  const appointmentCollection = client.db("DoctorsPortal").collection("appointments");
  // console.log("Database Connected Succesfully");

  app.post('/addAppointment', (req, res) => {
      const appointment = req.body;
      console.log(appointment)
      appointmentCollection.insertOne(appointment)
      .then(result => {
        console.log(result.insertedCount)
        res.send(result.insertedCount > 0)
      })
  });

  app.get('/appointments', (req, res) => {
    appointmentCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })


  app.post('/appointmentsByDate', (req, res) => {
      const date = req.body;
      console.log(date.date)
      appointmentCollection.find({date: date.date})
      .toArray((err, documents) => {
          res.send(documents)
      })
  });

  app.post('/addADoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    console.log(name, email, file);
    file.mv(`${__dirname}/doctors/${file.name}`, err => {  //express file upload (google search)
        if(err){
          console.log(err);
          return res.status(500).send({msg: 'Failed to upload image'})
        }
        return res.send({name: file.name, path:`/${file.name}`})
    })
  })


});


app.listen(process.env.PORT || port)




