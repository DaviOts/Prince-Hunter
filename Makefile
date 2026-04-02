.PHONY: help up down test test-watch lint format


PROJECT_NAME=Prince-Hunter

#Show command options
help:
	@echo "========================================"
	@echo "🤴 $(PROJECT_NAME) - Makefile Helper"
	@echo "========================================"
	@echo "Available commands:"
	@echo "  make up          - Start local infrastructure (Docker)"
	@echo "  make down        - Stop and remove infrastructure"
	@echo "  make test        - Run all Jest tests"
	@echo "  make test-watch  - Run tests in watch mode"
	@echo "  make lint        - Run ESLint to review code"
	@echo "  make format      - Run Prettier to format code"
	@echo "========================================"

#spin up project infrastructure (Databases, Redis, etc)
up:
	@echo " Starting local infrastructure..."
	docker-compose up -d

#spin down infrastructure
down:
	@echo " Stopping services..."
	docker-compose down

# run Jest tests
test:
	@echo " Running tests..."
	npm run test
	
# run Jest tests in watch mode
test-watch:
	@echo " Watching tests..."
	npm run test:watch

# code standards
lint:
	@echo " Running Linter (ESLint)..."
	npm run lint

format:
	@echo " Running Prettier..."
	npm run format
