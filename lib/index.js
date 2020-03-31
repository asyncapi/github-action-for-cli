const core = require('@actions/core');
const Generator = require('@asyncapi/generator');
const path = require('path');
const { paramParser, createOutputDir, listOutputFiles } = require('./utils');

const DEFAULT_TEMPLATE = '@asyncapi/markdown-template@0.3.0';
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

    const generator = new Generator(template, absoluteOutputPath, { 
      templateParams: parameters,
      forceWrite: true
    });

    await generator.generateFromFile(path.resolve(workdir,filepath));

    core.setOutput('files', await listOutputFiles(absoluteOutputPath));
  } catch (e) {
    core.setFailed(e.message);
  }
}
  
run();
