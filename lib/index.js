const core = require('@actions/core');
const Generator = require('@asyncapi/generator');
const path = require('path');
const { paramParser, createOutputDir, listOutputFiles } = require('./utils');

const DEFAULT_TEMPLATE = '@asyncapi/markdown-template@0.9.0';
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
    const pathToAsyncapiFile = path.resolve(workdir,filepath);

    core.debug('Template:', template);
    core.debug('Filepath:', filepath);
    core.debug('Parameters:', parameters);
    core.debug('Output:', output);
    core.debug('Workdir:', workdir);
    core.debug('AbsoluteOutputPath:', absoluteOutputPath);
    core.debug('PathToAsyncapiFile:', pathToAsyncapiFile);

    createOutputDir(absoluteOutputPath);

    const generator = new Generator(template, absoluteOutputPath, { 
      templateParams: parameters,
      forceWrite: true
    });

    await generator.generateFromFile(pathToAsyncapiFile);

    core.setOutput('files', await listOutputFiles(absoluteOutputPath));
  } catch (e) {
    core.setFailed(e.message);
  }
}
  
run();
