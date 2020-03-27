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

## Example usage with other actions

### Workflow with publishing generated HTML to GitHub Pages

### Workflow with publishing generated HTML to Netlify