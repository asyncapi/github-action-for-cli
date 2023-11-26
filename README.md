# GitHub Action for Generator
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

This action exposes the [AsyncAPI CLI](https://github.com/asyncapi/cli). It allows you to generate documentation, validate AsyncAPI documents, convert between different AsyncAPI versions and much more.

## Inputs

### `cli_version`

Version of the AsyncAPI CLI you wish to use. You can find all available versions [here](https://github.com/asyncapi/cli/releases). 

**Default** points to the`latest` version.

> [!TIP]
> We recommend to always specify the version of the CLI to not encounter any issues with the action in case of release of the CLI is not compatible with your workflow.

### `command`

Command that you wish to run. You can find all available commands Available commands are:
- `generate` - generates documentation from AsyncAPI document
- `validate` - validates AsyncAPI document
- `optimize` - optimizes AsyncAPI document
- `custom` - allows you to run any command that is available in the AsyncAPI CLI. You can find all available commands [here](https://www.asyncapi.com/docs/tools/cli/usage).

**Default** points to `generate` command.

> [!IMPORTANT]
> In case you want to use `custom` command, you need to pass an array of commands to the [`custom_command`](#custom_command) input.
> For example, if you want to run `asyncapi bundle ./asyncapi.yaml --output final-asyncapi.yaml` you need to pass `["bundle ./asyncapi.yaml --output final-asyncapi.yaml"]` to the `custom_command` input.

### `custom_command`

In case you want to use `custom` commands, you need to pass an array of commands to this input.

**Default** points to '' (empty string).

Sample usage:

```yaml
- name: Generating HTML from my AsyncAPI document
  uses: docker://asyncapi/github-action-for-cli:2.0.0
  with:
    command: custom
    custom_command: |
      - bundle ./asyncapi.yaml --output final-asyncapi.yaml;
      - validate ./final-asyncapi.yaml;
      - generate ./final-asyncapi.yaml @asyncapi/html-template@0.15.4;
```

This passes three commands to the action in the following format:

```yaml
'- bundle ./asyncapi.yaml --output final-asyncapi.yaml; - validate ./final-asyncapi.yaml; - generate ./final-asyncapi.yaml @asyncapi/html-template@0.15.4;'
```

> [!CAUTION]
> Format of the commands is very important. Each command needs to be separated by `;` and each command needs to start with `- ` like you are passing an array of commands, (but you are not its just a string due to `|` in YAML).

### `config_file`

Path to the AsyncAPI CLI configuration file. You can find more information about the configuration file [here](#configuration-file).

The configuration file is optional. If you do not pass it, the action will use the default configuration file.

**Default** points to `action-config.json` in the root of the working directory.

<hr >

## Configuration file

The configuration file is a JSON file that contains all the information that you would need to run the AsyncAPI CLI. The file is optional. If you do not pass it, the action will use the [default configuration file](./action-config.json).

The configuration file should follow this [schema](./config.schema.json) and this should be added to the root of the configuration file.

```json
{
  "$schema": "https://raw.githubusercontent.com/asyncapi/asyncapi-config/v2.0.0/schema.json"
}
```

### Schema Overview

- **`files`** (Array): The list of files to be processed by the GitHub Action for CLI.

  Each item in the array consists of:
  
  - **`file`** (String): The file to be processed by the GitHub Action for CLI. Example: `"./asyncapi.yaml"`
  
  - **`command`** (String): The command to be executed by the GitHub Action for CLI. It can be one of the following:
    - _"generate"_
    - _"validate"_
    - _"optimize"_
    - _"custom"_

  - **`parameters`** (String): Additional parameters to be passed to the command. Example: `"--output ./output"`

  - **`type`** (String): Type of generation to be executed by the CLI. Required if `command` is `"generate"`. It can be:
    - _"template"_
    - _"model"_

  - **`language`** (String): Language in which the models should be generated. Required if `command` is `"generate"` and `type` is `"model"`. It can be:
    - _"typescript"_
    - _"csharp"_
    - _"golang"_
    - _"java"_
    - _"javascript"_
    - _"dart"_
    - _"python"_
    - _"rust"_
    - _"kotlin"_
    - _"php"_
    - _"cplusplus"_

  - **`template`** (String): Template to be used for generation. Required if `command` is `"generate"` and `type` is `"template"`. Example: `"@asyncapi/html-template"`


### Example:-

```json
{
  "$schema": "https://raw.githubusercontent.com/asyncapi/asyncapi-config/v2.0.0/schema.json",
  "files": [
    {
      "file": "./asyncapi.yaml",
      "command": "generate",
      "parameters": "--output ./output",
      "type": "template",
      "template": "@asyncapi/html-template"
    },
    {
      "file": "./asyncapi.yaml",
      "command": "generate",
      "parameters": "--output ./output",
      "type": "model",
      "language": "typescript"
    },
    {
      "file": "./asyncapi.yaml",
      "command": "validate",
      "parameters": ""
    }
  ]
}
```

> [!WARNING]
> ### Validation Constraints
> - `files` is required.
> - Each item in `files` must include `file` and `command`.
> - If `command` is **"generate"**, then **type** is required.
>   - If **type** is **"model"**, then **language** is required.
>   - If **type** is **"template"**, then **template** is required.

<hr >

## Example usage

### Basic

In case all defaults are fine for you, just add such step:

```yaml
- name: Generating Markdown from my AsyncAPI document
  uses: docker://asyncapi/github-action-for-cli:3.0.0
```

### Using all possible inputs

In case you do not want to use defaults, you for example want to use different template:

```yaml
- name: Generating HTML from my AsyncAPI document
  uses: docker://asyncapi/github-action-for-cli:3.0.0
  with:
    cli_version: 1.0.0
    command: generate
    config_file: ./asyncapi-config.json
    custom_command: |
      - bundle ./asyncapi.yaml --output final-asyncapi.yaml;
      - validate ./final-asyncapi.yaml;
      - generate ./final-asyncapi.yaml @asyncapi/html-template@0.15.4;
```

### Example workflow with publishing generated HTML to GitHub Pages

In case you want to validate your asyncapi file first, and also send generated HTML to GitHub Pages this is how full workflow could look like:

#### Config File

```json
{
  "$schema": "https://raw.githubusercontent.com/asyncapi/asyncapi-config/v2.0.0/schema.json",
  "files": [
    {
      "file": "./docs/api/my-asyncapi.yml",
      "command": "validate",                  // Validate AsyncAPI document first
      "parameters": ""
    },
    {
      "file": "./docs/api/my-asyncapi.yml",
      "command": "generate",
      "parameters": "--param baseHref=/test-experiment/ sidebarOrganization=byTags --output ./generated-html", //Generate HTML with some parameters in generated-html folder with baseHref and sidebarOrganization parameters.
      "type": "template",
      "template": "@asyncapi/html-template@0.9.0" //In case of template from npm. Or can use a link.
    }
  ]
}
```

```yaml
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
      
    #In case you do not want to use defaults, you for example want to use different template
    - name: Generating HTML from my AsyncAPI document
      uses: docker://asyncapi/github-action-for-cli:3.0.0
      with:
        cli_version: 1.0.0
        command: generate
        config_file: ./docs/api/asyncapi-config.json
        
      
    #Using another action that takes generated HTML and pushes it to GH Pages
    - name: Deploy GH page
      uses: JamesIves/github-pages-deploy-action@3.4.2
      with:
        ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        BRANCH: gh-pages
        FOLDER: generated-html
```


## Troubleshooting

You can enable more log information in GitHub Action by adding `ACTIONS_STEP_DEBUG` secret to repository where you want to use this action. Set the value of this secret to `true` and you''ll notice more debug logs from this action.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.brainfart.dev/"><img src="https://avatars.githubusercontent.com/u/6995927?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="https://github.com/asyncapi/github-action-for-generator/commits?author=derberg" title="Code">💻</a> <a href="#maintenance-derberg" title="Maintenance">🚧</a> <a href="#infra-derberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/asyncapi/github-action-for-generator/pulls?q=is%3Apr+reviewed-by%3Aderberg" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/magicmatatjahu"><img src="https://avatars.githubusercontent.com/u/20404945?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maciej Urbańczyk</b></sub></a><br /><a href="https://github.com/asyncapi/github-action-for-generator/pulls?q=is%3Apr+reviewed-by%3Amagicmatatjahu" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://www.victormartingarcia.com"><img src="https://avatars.githubusercontent.com/u/659832?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Victor</b></sub></a><br /><a href="https://github.com/asyncapi/github-action-for-generator/commits?author=victormartingarcia" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/HUTCHHUTCHHUTCH"><img src="https://avatars.githubusercontent.com/u/55915170?v=4?s=100" width="100px;" alt=""/><br /><sub><b>HUTCHHUTCHHUTCH</b></sub></a><br /><a href="#infra-HUTCHHUTCHHUTCH" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/pioneer2k"><img src="https://avatars.githubusercontent.com/u/32297829?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thomas Heyer</b></sub></a><br /><a href="#infra-pioneer2k" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
