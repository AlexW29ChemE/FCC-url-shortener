require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// connect to mongoose
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
  console.log('Connected to Mongo DB: ',process.env.MONGO_URI)
}).catch((err)=>{
  console.log('Unable to connect to Mongo, Make sure its running: ',process.env.MONGO_URI)
})

const urlRecordSchema = new mongoose.Schema({
  url:String, shortUrl:Number
})
const URLRecord = mongoose.model('urlRecord',urlRecordSchema);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
// logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

dns.lookup("localhost", (err, address) => {
  console.log(err, address);
});

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;
  const [scheme, host, ...rest] = url.split(/:\/\/|[/:]/);

  //validate url
  dns.lookup(host, (err, address) => {
    console.log({ url, scheme, host, rest, err, address });
    if (address) {
      // check for existing entries
      URLRecord.findOne({url},(err,data)=>{
        if(data){
          res.json({ original_url: url, short_url: data.shortUrl });
        }else{
          // find new reference value and create new entry
          URLRecord.count((err,data)=>{
            if(err) return res.json({ error: "Database Error" });
            shortUrl = data+1
            URLRecord.create({url,shortUrl},(err,data)=>{
              if(err) return res.json({ error: "Database Error" });
              res.json({ original_url: url, short_url: shortUrl });
            })
          })
        }
      })
    } else {
      res.json({ error: "invalid url" });
    }
  });
});

app.get("/api/shorturl/:shorturl", (req, res) => {

URLRecord.findOne({shortUrl:req.params.shorturl},(err,data)=>{
  if(err) return res.status(404).json({error:'Full url not found'})
    console.log("redirect to ", data.url);
  res.redirect(data.url);

})
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
