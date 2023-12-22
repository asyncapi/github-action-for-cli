DEFAULT_VERSION = 'latest'
DEFAULT_COMMAND = 'generate'
TEST_FILEPATH = 'test/asyncapi.yml'
DEFAULT_TEMPLATE = '@asyncapi/markdown-template@0.10.0'
DEFAULT_LANGUAGE = ''
DEFAULT_OUTPUT = 'output'
DEFAULT_PARAMETERS = ''
DEFAULT_CUSTOM_COMMANDS = ''
CUSTOM_COMMANDS = 'validate test/asyncapi.yml'

run:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

test: test-default test-validate-success test-validate-fail test-custom-output test-custom-commands

# Test cases

# Tests the default configuration without any inputs
test-default:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests the validate command with a valid specification
test-validate-success:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) 'validate' $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests the validate command with an invalid specification
test-validate-fail:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) 'validate' './test/specification-invalid.yml' $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests if the generator can output to a custom directory
test-custom-output:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) 'typescript' './output/custom-output' $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

# Tests if the action prefers custom commands over the default command
test-custom-commands:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) 'typescript' './output/custom-output' $(DEFAULT_PARAMETERS) $(CUSTOM_COMMANDS) 

# Tests if the action fails when the input is invalid (e.g. invalid template as is the case here) 
fail-test:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) '' $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 
