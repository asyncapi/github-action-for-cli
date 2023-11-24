#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status.
# Treat unset variables as an error when substituting.
set -eu

NC='\033[0m' # No Color
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'

echo -e "${GREEN}Installing AsyncAPI CLI...${NC}"

CLI_VERSION="$1"
COMMAND="$2"
CONFIG_FILE="$3"
CUSTOM_COMMANDS_TEMP="$4"
VERBOSE="$5"

echo "::group::Debug information"
if [ -n "$(asyncapi --version)" ]; then
  echo -e "${YELLOW}AsyncAPI CLI already installed. Skipping...${NC}"
else 
  if [ -n "$CLI_VERSION" ]; then
    echo -e "${BLUE}AsyncAPI CLI version to install:${NC}" "$CLI_VERSION"
    npm install -g @asyncapi/cli@"$CLI_VERSION"
  else
    npm install -g @asyncapi/cli
  fi
fi
echo "::endgroup::"

echo -e "${BLUE}AsyncAPI CLI version:${NC}" "$(asyncapi --version)"

echo -e "${GREEN}Executing AsyncAPI CLI...${NC}"

CUSTOM_COMMANDS=() # Array to store custom commands

# Parse custom commands of the form "- command1; - command2; - command3;"
if [ -n "$CUSTOM_COMMANDS_TEMP" ]; then
  echo -e "${BLUE}Executing custom commands:${NC}..."
  IFS=';' read -ra CUSTOM_COMMANDS <<< "$CUSTOM_COMMANDS_TEMP"

  echo "::group::Debug information"
  for i in "${CUSTOM_COMMANDS[@]}"; do
    # Strip leading and trailing whitespace using xargs
    i=$(echo "$i" | xargs)
    # Strip leading -
    i="${i#-}"
    # Strip leading and trailing whitespace
    i=$(echo "$i" | xargs)

    echo -e "${BLUE}Executing custom command:${NC} asyncapi" "$i"
    eval "asyncapi $i"
  done
  echo "::endgroup::"
  exit 0
fi 

echo "::group::Debug information"
echo -e "${BLUE}Command:${NC}" "$COMMAND"
echo -e "${BLUE}Config file:${NC}" "$CONFIG_FILE"
echo -e "${BLUE}Verbose:${NC}" "$VERBOSE"
echo "::endgroup::"


if [ -z "$CONFIG_FILE" ]; then
  echo -e "${YELLOW}NOTE: Using default config file:${NC}" "$CONFIG_FILE"
  CONFIG_FILE="./action-config.json"
fi

if [ -f "$CONFIG_FILE" ]; then 
  echo -e "${BLUE}Found the config file:${NC}" "$CONFIG_FILE"
  echo "::group::Debug information"
  cat "$CONFIG_FILE"
  echo "::endgroup::"
else 
  echo -e "${RED}Config file not found:${NC}" "$CONFIG_FILE"
  echo -e "${YELLOW}NOTE: See https://github.com/asyncapi/github-action-for-generatork#config-file-format to know more about"
  echo -e "customizing the action using a config file.${NC}"
  exit 1
fi

parse_config_file () {
  echo -e "${BLUE}Parsing config file...${NC}"
  echo "::group::Debug information"
  echo -e "${BLUE}Config file:${NC}" 
  cat "$CONFIG_FILE" | jq

  # Read the config file and parse the JSON
  files=$(cat "$CONFIG_FILE" | jq -r '.files[] | "\(.file) \(.command) \(.parameters)"')

  # Replace newlines with ;
  files=$(echo "$files" | tr '\n' ';')
  echo -e "${BLUE}Files:${NC}" "$files"

  # Split the files string into an array 
  IFS=';' read -ra file_array <<< "$files"
  
  echo "::endgroup::"
}

handle_validate () {
  parse_config_file

  echo -e "${BLUE}Validating AsyncAPI files...${NC}"
  echo "::group::Debug information"

  for file in "${file_array[@]}"; do
    # Split the file string into an array 
    IFS=' ' read -ra file_command <<< "$file"
    file="${file_command[0]:-}"
    command="${file_command[1]:-}"
    parameters="${file_command[2]:-}"

    echo -e "${BLUE}File:${NC}" "$file"
    echo -e "${BLUE}Command:${NC}" "$command"
    echo -e "${BLUE}Parameters:${NC}" "$parameters"

    if [ $command == "validate" ]; then
      if [ -n "$parameters" ]; then
        echo -e "${BLUE}Executing command:${NC}" "asyncapi validate $file $parameters"
        eval "asyncapi validate $file $parameters"
      else
        echo -e "${BLUE}Executing command:${NC}" "asyncapi $command $file"
        eval "asyncapi validate $file"
      fi
    fi
  done
}

