//basic setting
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
// app.use('/', express.static('public'));
//美化json排版
app.set('json spaces', 2);

app.listen(4000, () => {
  console.log('the server is running on 4000');
});


//Routes:
app.use(require('./server/routes/sign'));
app.use(require('./server/routes/diary'));
app.use(require('./server/routes/progress'));

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(500).send(err);
});

app.use((req, res)=> {
res.sendStatus(404);
});
