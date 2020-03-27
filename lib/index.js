const core = require('@actions/core');
const Generator = require('@asyncapi/generator');
const path = require('path');
const fs = require('fs');
const { paramParser, createOutputDir } = require('./utils');

const DEFAULT_TEMPLATE = '@asyncapi/markdown-template';
const DEFAULT_FILEPATH = 'asyncapi.yml';
const DEFAULT_OUTPUT = 'output';

async function run() {
  try { 
    const template = core.getInput('template') || DEFAULT_TEMPLATE;
    const filepath = core.getInput('filepath') || DEFAULT_FILEPATH;
    const parameters = paramParser(core.getInput('parameters'));
    const output = core.getInput('output') || DEFAULT_OUTPUT;
    const workdir = process.env.GITHUB_WORKSPACE || __dirname;
    const absoluteOutputPath = path.resolve(workdir, output);
    
    createOutputDir(absoluteOutputPath);
    
    process.env.DEFAULT_TEMPLATES_DIR = path.resolve(workdir, 'node_modules');
    const generator = new Generator(template, absoluteOutputPath, { 
      templateParams: parameters,
      forceWrite: true
    });

    await generator.generateFromFile(path.resolve(workdir,filepath));

    const files = fs.readdirSync(absoluteOutputPath).toString();
    core.setOutput('files', files);
  } catch (e) {
    core.setFailed(e.message);
  }
}
  
run();
