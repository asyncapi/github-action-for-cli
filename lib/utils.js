const fs = require('fs');
const readdirp = require('readdirp');

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

const createOutputDir = function(dir) {
  if (typeof dir === 'string' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};

const listOutputFiles = async function(dir) {
  let files = '';
  for await (const file of readdirp(dir)) {
    files += `${JSON.stringify(file.path)};`;
  }
  return files;
};
  
module.exports = {
  paramParser, 
  createOutputDir,
  listOutputFiles
};
