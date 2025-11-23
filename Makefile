.PHONY: test test-backend test-frontend install-test-deps rebuild-backend help

help:
	@echo "Available commands:"
	@echo "  make test              - Run all tests (backend + frontend)"
	@echo "  make test-backend      - Run backend API tests"
	@echo "  make test-frontend     - Run frontend UI tests"
	@echo "  make rebuild-backend   - Rebuild backend with test deps"
	@echo "  make install-frontend  - Install frontend test deps"

# Run all tests
test: test-backend test-frontend

# Backend tests
test-backend:
	@echo "Running backend tests..."
	docker exec ais_backend python -m pytest tests/ -v

# Frontend tests with auto dependency installation
test-frontend:
	@echo "Checking frontend dependencies..."
	@if [ ! -d "frontend/node_modules" ]; then \
		echo "Installing frontend dependencies..."; \
		cd frontend && npm install; \
	fi
	@echo "Running frontend tests..."
	cd frontend && npm test -- --run

# Rebuild backend container with test dependencies
rebuild-backend:
	@echo "Rebuilding backend container..."
	docker compose up -d --build backend

# Install frontend test dependencies
install-frontend:
	@echo "Installing frontend test dependencies..."
	cd frontend && npm install

