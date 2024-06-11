require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const dns = require('dns')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//mock database - can replace with mongoose database
const db = new Map()

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({extended:false}))
// logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
   
dns.lookup('localhost',(err,address)=>{
console.log(err,address)
})

app.post('/api/shorturl',(req,res)=>{
const {url} = req.body
const shortUrl = db.size
const [scheme,host,...rest] = url.split(/:\/\/|[/:]/)

dns.lookup(host,(err,address)=>{
  console.log({url,scheme, host,rest,err,address})
  if(address){
    db.set(shortUrl,url)
    res.json({original_url:url,short_url:shortUrl})
  }else{
    res.json({error:'invalid url'})
  }
})

})

app.get('/api/shorturl/:shorturl',(req,res)=>{
  const fullUrl = db.get(Number(req.params.shorturl))
console.log('redirect to ',fullUrl)
res.redirect(fullUrl);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
