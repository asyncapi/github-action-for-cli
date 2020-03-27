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

    //TODO Hack to make sure installation of the template works. It doesn't work when runs in context of GITHUB_WORKSPACE (repo where action is used)
    if (process.env.GITHUB_WORKSPACE) process.env.INSTALL_LOCATION = '/home/runner/work/_actions/derberg/github-action-for-generator/v1.0.13/';
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
