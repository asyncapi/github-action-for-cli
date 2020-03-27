const core = require('@actions/core');
const Generator = require('@asyncapi/generator');
const path = require('path');
const fs = require('fs');
const { paramParser, createDefaultDir } = require('./utils');

const DEFAULT_TEMPLATE = '@asyncapi/markdown-template';
const DEFAULT_FILEPATH = 'asyncapi.yml';
const DEFAULT_OUTPUT = 'output';

async function run() {
  try { 
    const template = core.getInput('template') || DEFAULT_TEMPLATE;
    const filepath = core.getInput('filepath') || DEFAULT_FILEPATH;
    const parameters = paramParser(core.getInput('parameters'));
    const output = createDefaultDir(core.getInput('output')) || createDefaultDir(DEFAULT_OUTPUT);
    const workdir = process.env.GITHUB_WORKSPACE || __dirname;

    console.log(core.getInput('output'));
    console.log('dupa');
    console.log(path.resolve(__dirname, output));

    const generator = new Generator(template, path.resolve(workdir, output), { templateParams: parameters });
    
    await generator.generateFromFile(path.resolve(workdir,filepath));

    const files = fs.readdirSync(output);
    core.setOutput('files', files.toString());
  } catch (e) {
    core.setFailed(e.message);
  }
}
  
run();
