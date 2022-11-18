const express = require("express")
const dotenv = require("dotenv").config();
const cors = require("cors")
const shortid = require("shortid")

const port = process.env.PORT;
const {connectDB} = require("./util/db.js");
const Url = require("./model/Url.js")
const utils = require("./util/validator.js")


// Database connection
connectDB()
const app = express();


// MIDDLEWARES

// cors for cross origin requesters to the frontend application
app.use(cors());
app.use(express.json());



// get all saved URLs
app.get("/", async (req, res, next) => {
    try {
        const allUrls = await Url.find()
        res.status(200).json(allUrls)
    } catch (error) {
        next(error)
    }
});
  
  // URL shortener endpoint
app.post("/", async (req, res) => {
    console.log("HERE", req.body.url);
    const { origUrl } = req.body;
    const base = process.env.DOMAIN_URL;
  
    const urlId = shortid.generate();
    if (utils.validateUrl(origUrl)) {
      try {
        let url = await Url.findOne({ origUrl });
        if (url) {
          res.json(url);
        } else {
          const shortUrl = `${base}/${urlId}`;
  
          url = new Url({
            origUrl,
            shortUrl,
            urlId,
            date: new Date(),
          });
  
          await url.save();
          res.json(url);
        }
      } catch (err) {
        console.log(err);
        res.status(500).json("Server Error");
      }
    } else {
      res.status(400).json("Invalid Original Url");
    }
  });
  


// redirect endpoint
app.get("/:urlId", async (req, res) => {
    try {
      const url = await Url.findOne({ urlId: req.params.urlId })
      if (url) {
        url.clicks++;
        url.save();
        return res.redirect(url.origUrl);
      } else res.status(404).json("Not found");
    } catch (err) {
      res.status(500).json("Server Error");
    }
});


// delete url
app.delete("/:urlId", async (req, res) => {
    try {
        await Url.findByIdAndDelete({ urlId: req.params.urlId })
    } catch (error) {
        res.status(500).json("Server Error");
    }
})


app.listen(5555, () => {
    console.log(`Server is running on port ${port} `)
})