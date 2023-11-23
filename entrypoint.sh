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
CUSTOM_COMMAND="$4"
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

echo "::group::Debug information"
echo -e "${BLUE}Command:${NC}" "$COMMAND"
echo -e "${BLUE}Config file:${NC}" "$CONFIG_FILE"
echo -e "${BLUE}Custom command:${NC}" "$CUSTOM_COMMAND"
echo -e "${BLUE}Verbose:${NC}" "$VERBOSE"
echo "::endgroup::"

if [ -n "$CUSTOM_COMMAND" ]; then
  echo -e "${BLUE}Executing custom command:${NC}" "$CUSTOM_COMMAND"
  eval "$CUSTOM_COMMAND"
  exit 0
fi

if [ -n "$CONFIG_FILE" ]; then
  CONFIG_FILE = "./action-config.json"
fi

if [ -f "$CONFIG_FILE" ]; then 
  echo -e "${BLUE}Found the config file:${NC}" "$CONFIG_FILE"
  echo "::group::Debug information"
  cat "$CONFIG_FILE"
  echo "::endgroup::"
else 
  echo -e "${RED}Config file not found:${NC}" "$CONFIG_FILE"
  echo -e "${YELLOW}NOTE: See https://github.com/asyncapi/github-action-for-generatork#config-file-format to know more about"
  echo -e "customizing markdown-link-check by using a configuration file.${NC}"
  exit 1
fi


