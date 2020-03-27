# GitHub Action for Generator

This action generates whatever you want using your AsyncAPI document. It uses [AsyncAPI Generator](https://github.com/asyncapi/generator/)

## Inputs

### `template`

Template for the generator. Official templates are listed here https://github.com/search?q=topic%3Aasyncapi+topic%3Agenerator+topic%3Atemplate. You can pass template as npm package, url to git repository, link to tar file or local template.

**Default** points to `@asyncapi/markdown-template` template.

### `filepath`

Location of the AsyncAPI document.

**Default** expects `asyncapi.yml` in the root of the working directory.

### `parameters`

The template that you use might support and even require specific parameters to be passed to the template for the generation.

### `output`

Directory where to put the generated files.

**Default** points to `output` directory in the working directory.

## Outputs

### `files`

List of generated files.

## Example usage

### Basic

In case all defaults are fine for you, just add such step:

```
- name: Generating Markdown from my AsyncAPI document
  uses: actions/github-action-for-generator@v0.0.2
```

### Using all possible inputs

In case you do not want to use defaults, you for example want to use different template:

```
- name: Generating Markdown from my AsyncAPI document
  uses: actions/github-action-for-generator@v0.0.2
  with:
    template: '@asyncapi/html' #In case of template from npm, because of @ it must be in quotes
    filepath: my-api/asyncapi.yml
    parameters: 'baseHref=/my-repo-name/ sidebarOrganization=byTags' #space separated list of key/values
    output: 'generated-html'
```

### Accessing output of generation step

In case you want to have more steps in your workflow after generation and you need to know what files were exactly generated, you can access this information as shown below:

```
- name: Generating Markdown from my AsyncAPI document
  id: generation
  uses: actions/github-action-for-generator@v0.0.2
- name: Another step where I want to know what files were generated
  run: echo steps.generation.outputs.files
```

### Example workflow with publishing generated HTML to GitHub Pages

In case you want to validate your asyncapi file first, and also send generated HTML to GitHub Pages this is how full workflow could look like:

```
name: AsyncAPI documents processing

on:
  push:
    branches: [ master ]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
    #"standard step" where repo needs to be checked-out first
    - name: Checkout repo
      uses: actions/checkout@v2
    #Using another action for AsyncAPI for validation
    - name: asyncapi-github-action
      uses: WaleedAshraf/asyncapi-github-action@v0.0.2
      with:
        filepath: docs/api/my-asyncapi.yml
      
    #In case you do not want to use defaults, you for example want to use different template
    - name: Generating HTML from my AsyncAPI document
      uses: derberg/github-action-for-generator@vv0.0.2
      with:
        template: '@asyncapi/html'
        filepath: docs/api/my-asyncapi.yaml
        parameters: 'baseHref=/test-experiment/ sidebarOrganization=byTags' #space separated list of key/values
        output: 'generated-html'
      
    #Using another action that takes generated HTML and pushes it to GH Pages
    - name: Deploy GH page
      uses: JamesIves/github-pages-deploy-action@3.4.2
      with:
        ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        BRANCH: gh-pages
        FOLDER: generated-html
```
