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

test: test-1 test-2 test-3 test-4 test-5 test-6

test-1:
	@bash ./entrypoint.sh 1.1.1 $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

test-2:
	@bash ./entrypoint.sh 1.1.1 'validate' $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

test-3:
	@bash ./entrypoint.sh 1.1.1 'validate' './test/specification-invalid.yml' $(DEFAULT_TEMPLATE) $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

test-4:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) 'typescript' './output/custom-output' $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 

test-5:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) $(DEFAULT_TEMPLATE) 'typescript' './output/custom-output' $(DEFAULT_PARAMETERS) $(CUSTOM_COMMANDS) 

test-6:
	@bash ./entrypoint.sh $(DEFAULT_VERSION) $(DEFAULT_COMMAND) $(TEST_FILEPATH) '' $(DEFAULT_LANGUAGE) $(DEFAULT_OUTPUT) $(DEFAULT_PARAMETERS) $(DEFAULT_CUSTOM_COMMANDS) 