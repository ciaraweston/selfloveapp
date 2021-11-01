const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient


let db, collection;

const url = "mongodb+srv://cweston0727:RIpcpqZAFy0W9qQu@cluster0.ahgdx.mongodb.net/dailyaffirmations?retryWrites=true&w=majority"
const dbName = "cweston";

app.listen(3000, () => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
      throw error;
    }
    db = client.db(dbName);
    console.log("Connected to `" + dbName + "`!");
  });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', { messages: result })
  })
})

app.post('/messages', (req, res) => {
  db.collection('messages').insertOne({ msg: req.body.msg, heart: 0 }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to db')
    res.redirect('/')
  })
})

app.get('/search', (req, res) => {
  console.log(req.query.search)
  db.collection('messages').find({ "msg": { $regex: req.query.search, $options: 'i' } }).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', { messages: result })
  })
})

app.put('/messages', (req, res) => {
  db.collection('messages')
    .findOneAndUpdate({ msg: req.body.msg }, {
      $inc: {
        heart: 1,
      }
    }, {
      sort: { _id: -1 },
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
})
