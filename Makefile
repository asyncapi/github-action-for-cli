CLI_VERSION = ''
DEFAULT_COMMAND = 'generate'
DEFAULT_CONFIG_FILE = ./action-config.json
DEFAULT_CUSTOM_COMMANDS = ''
DEFAULT_VERBOSE = 'false'
CUSTOM_COMMANDS = '- validate test/asyncapi.yml; - validate test/specification-invalid.yml > output/error.txt;'

run:
	@bash ./entrypoint.sh $(CLI_VERSION) $(DEFAULT_COMMAND) $(DEFAULT_CONFIG_FILE) $(DEFAULT_CUSTOM_COMMANDS) $(DEFAULT_VERBOSE)

run-custom:
	@bash ./entrypoint.sh $(CLI_VERSION) $(DEFAULT_COMMAND) $(DEFAULT_CONFIG_FILE) $(CUSTOM_COMMANDS) $(DEFAULT_VERBOSE)