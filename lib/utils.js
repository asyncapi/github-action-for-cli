const fs = require('fs');

const paramParser = function(input) {
  const params = {};
  
  if (!input) return params;
  if (!input.includes('=')) throw new Error(`Invalid param ${input}. It must be in the format of name=value.`);
  
  input.split(' ').forEach(el => {
    const chunks = el.split('=');
    const paramName = chunks[0];
    const paramValue = chunks[1];
    params[paramName] = paramValue;         
  });
  
  return params;
};

const createDefaultDir = function(dirName) {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
  }
  return dirName;
};
  
module.exports = {
  paramParser, 
  createDefaultDir
};
