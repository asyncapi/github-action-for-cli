#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status.
# Treat unset variables as an error when substituting.
set -eu

NC='\033[0m' # No Color
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'

CLI_VERSION="$1"
COMMAND="$2"
FILEPATH="$3"
TEMPLATE="$4"
LANGUAGE="$5"
OUTPUT="$6"
PARAMETERS="$7"
CUSTOM_COMMAND="$8"
VERBOSE="$9"

echo "::group::Debug information"
if [ -n "$CLI_VERSION" ]; then
  echo -e "${BLUE}CLI version:${NC}" "$CLI_VERSION"
  # Check if the CLI version is already installed or not
  output=$(asyncapi --version 2>&1)
  # output @asyncapi/cli/1.1.1 linux-x64 node-v20.8.1
  version=$(echo "$output" | cut -d' ' -f1 | cut -d '/' -f3)
  if [ "$version" == "$CLI_VERSION" ]; then
    echo -e "${BLUE}AsyncAPI CLI already installed:${NC}" "$CLI_VERSION" "...skipping"
  else 
    echo -e "${BLUE}Installing AsyncAPI CLI:${NC}" "$CLI_VERSION"
    npm install -g @asyncapi/cli@$CLI_VERSION
  fi
else
  echo -e "${BLUE}CLI version:${NC}" "latest"
fi
echo "::endgroup::"

echo -e "${BLUE}AsyncAPI CLI version:${NC}" "$(asyncapi --version)"

echo -e "${GREEN}Executing AsyncAPI CLI...${NC}"

if [ -n "$CUSTOM_COMMAND" ]; then
  echo "::group::Debug information" 
  echo -e "${BLUE}Executing custom command:${NC} asyncapi" "$CUSTOM_COMMAND"
  eval "asyncapi $CUSTOM_COMMAND"
  echo "::endgroup::"
  exit 0
fi 

echo "::group::Debug information"
echo -e "${BLUE}Command:${NC}" "$COMMAND"
echo -e "${BLUE}File:${NC}" "$FILEPATH"
echo -e "${BLUE}Template:${NC}" "$TEMPLATE"
echo -e "${BLUE}Language:${NC}" "$LANGUAGE"
echo -e "${BLUE}Output:${NC}" "$OUTPUT"
echo -e "${BLUE}Parameters:${NC}" "$PARAMETERS"
echo -e "${BLUE}Verbose:${NC}" "$VERBOSE"
echo "::endgroup::"

handle_file_error () {
  echo -e "${RED}Validation error: File not found:${NC}" "$1"
  echo -e "skipping...\n"
}

handle_validate () {
  echo -e "${BLUE}Validating AsyncAPI file...${NC}"
  echo "::group::Debug information"

  if [ ! -f "$FILEPATH" ]; then 
    handle_file_error "$FILEPATH"
    exit 1
  fi

  echo -e "${BLUE}Executing command:${NC}" "asyncapi validate $FILEPATH $PARAMETERS"
  eval "asyncapi validate $FILEPATH $PARAMETERS"
  echo "::endgroup::"
}

handle_optimize () {
  echo -e "${BLUE}Optimising AsyncAPI file...${NC}"
  echo "::group::Debug information"
  
  if [ ! -f "$FILEPATH" ]; then 
    handle_file_error "$FILEPATH"
    exit 1
  fi

  echo -e "${BLUE}Executing command:${NC}" "asyncapi optimize $FILEPATH $PARAMETERS"
  eval "asyncapi optimize $FILEPATH $PARAMETERS"
  echo "::endgroup::"
}

handle_generate () {
  echo -e "${BLUE}Generating AsyncAPI file...${NC}"
  echo "::group::Debug information"

  if [ ! -f "$FILEPATH" ]; then 
    handle_file_error "$FILEPATH"
    continue
  fi

  if [ -n "$LANGUAGE" ]; then
    echo -e "${BLUE}Executing command:${NC}" "asyncapi generate models $LANGUAGE $FILEPATH -o $OUTPUT $PARAMETERS"
    eval "asyncapi generate models $LANGUAGE $FILEPATH -o $OUTPUT $PARAMETERS"
  elif [ -n "$TEMPLATE" ]; then
    echo -e "${BLUE}Executing command:${NC}" "asyncapi generate fromTemplate $FILEPATH $TEMPLATE -o $OUTPUT $PARAMETERS"
    eval "asyncapi generate fromTemplate $FILEPATH $TEMPLATE -o $OUTPUT $PARAMETERS"  
  else
    echo -e "${RED}Invalid configuration:${NC} Either language or template must be specified."
    exit 1
  fi
}

if [ $COMMAND == "validate" ]; then
  handle_validate
elif [ $COMMAND == "optimize" ]; then
  handle_optimize
elif [ $COMMAND == "generate" ]; then
  handle_generate
else
  echo -e "${RED}Invalid command:${NC}" "$COMMAND"
  echo -e "${YELLOW}NOTE: Command can be either validate, optimize or generate.${NC}"
fi