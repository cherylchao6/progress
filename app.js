//basic setting
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/', express.static('public'));
//美化json排版
app.set('json spaces', 2);

app.listen(4000, () => {
  console.log('the server is running on 4000');
});


//Routes:
// app.use(require('./routes/createProduct'));
// app.use(require('./routes/ProductAPI'));
// app.use(require('./routes/auth'));
// app.use(require('./routes/marketing'));
// app.use(require('./routes/checkout'));




app.use((err, req, res, next)=> {
  res.status(500).send(err);
});

app.use((req, res)=> {
res.sendStatus(404);
});
