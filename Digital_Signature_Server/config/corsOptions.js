const path = require("path");
const whitelist = require(path.join(__dirname, "whitelist"));

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    
    if (whitelist.indexOf(origin) !== -1 || origin == undefined) {
      callback(null, true);
    } else {
      callback(new Error("Forbbiden by cross origin resource"));
    }
  },
  optionSuccessStatus: 200,
};

module.exports = corsOptions;
