const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

let messageQueue = require('./messageQueue');
module.exports.initialize = (queue) => {
  messageQueue = queue;
};

module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    next(); // invoke next() at the end of a request to help with testing!
  }
  if (req.method === 'GET'){
    if (req.url === '/background.jpg'){
      fs.readFile(module.exports.backgroundImageFile, function(err, data){
        if (err){
          res.writeHead(404, headers);
        }else{
          res.writeHead(200, headers);
          res.write(data, 'binary');
        }
        res.end();
        next();
      });
    }else if (req.url === '/'){
      res.writeHead(200, headers);
      res.end(messageQueue.dequeue());
    }
  }
  if (req.method === 'POST' && req.url === '/background.jpg'){
      var fileData = Buffer.alloc(0);

      req.on('data', (chunk) =>{
        console.log('chunk received');
        fileData = Buffer.concat([fileData, chunk]);
      })

      req.on('end', () =>{
        fs.writeFile(module.exports.backgroundImageFile, fileData, (err) => {
          res.writeHead(err ? 404 : 201, headers);
          res.end();
          next();
        })
      })
    }
  }
};