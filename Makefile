## ============================================================
##  TN Scheme Bot – Makefile Helper
##  Usage:  make <target>
## ============================================================

.DEFAULT_GOAL := help
APP_NAME      := tn-scheme-bot
COMPOSE       := docker compose
COMPOSE_DEV   := docker compose -f docker-compose.yml -f docker-compose.dev.yml

## ── Help ────────────────────────────────────────────────────
.PHONY: help
help:
	@echo ""
	@echo "  TN Scheme Bot – Docker Commands"
	@echo "  ────────────────────────────────────────────────────"
	@echo "  make setup        Copy .env.docker → .env (first time)"
	@echo "  make build        Build all Docker images"
	@echo "  make up           Start production stack"
	@echo "  make down         Stop and remove containers"
	@echo "  make down-v       Stop, remove containers AND volumes (fresh start)"
	@echo "  make seed         Run the database seeder manually"
	@echo "  make logs         Tail logs for all services"
	@echo "  make logs-app     Tail app service logs only"
	@echo "  make shell-app    Open shell inside app container"
	@echo "  make shell-mongo  Open mongosh inside mongo container"
	@echo "  make dev          Start development stack (with Vite HMR)"
	@echo "  make dev-down     Stop development stack"
	@echo "  make ps           Show running containers"
	@echo "  make clean        Remove all images, containers, volumes"
	@echo "  make rebuild      Full rebuild (no cache)"
	@echo ""

## ── Setup ───────────────────────────────────────────────────
.PHONY: setup
setup:
	@if [ ! -f .env ]; then \
		cp .env.docker .env; \
		echo "✅  .env created from .env.docker — fill in your secrets!"; \
	else \
		echo "⚠️   .env already exists. Edit it manually if needed."; \
	fi

## ── Build ───────────────────────────────────────────────────
.PHONY: build
build:
	$(COMPOSE) build --parallel

## ── Production ──────────────────────────────────────────────
.PHONY: up
up:
	$(COMPOSE) up -d
	@echo ""
	@echo "  🏛️  TN Scheme Bot is starting..."
	@echo "  ➜  App:     http://localhost:$$(grep APP_PORT .env 2>/dev/null | cut -d= -f2 || echo 3000)"
	@echo "  ➜  MongoDB: localhost:$$(grep MONGO_PORT .env 2>/dev/null | cut -d= -f2 || echo 27017)"
	@echo ""

.PHONY: down
down:
	$(COMPOSE) down

.PHONY: down-v
down-v:
	$(COMPOSE) down -v
	@echo "🗑️  All containers and volumes removed."

## ── Seeder ──────────────────────────────────────────────────
.PHONY: seed
seed:
	$(COMPOSE) run --rm seeder
	@echo "🌱  Database seeded!"

## ── Logs ────────────────────────────────────────────────────
.PHONY: logs
logs:
	$(COMPOSE) logs -f

.PHONY: logs-app
logs-app:
	$(COMPOSE) logs -f app

## ── Shell / Debug ───────────────────────────────────────────
.PHONY: shell-app
shell-app:
	$(COMPOSE) exec app sh

.PHONY: shell-mongo
shell-mongo:
	$(COMPOSE) exec mongo mongosh \
		-u $$(grep MONGO_ROOT_USER .env | cut -d= -f2) \
		-p $$(grep MONGO_ROOT_PASS .env | cut -d= -f2) \
		--authenticationDatabase admin \
		tn-scheme-bot

## ── Development ─────────────────────────────────────────────
.PHONY: dev
dev:
	$(COMPOSE_DEV) up -d
	@echo ""
	@echo "  🔧  Development stack running..."
	@echo "  ➜  Backend:  http://localhost:3000"
	@echo "  ➜  Frontend: http://localhost:5173 (Vite HMR)"
	@echo ""

.PHONY: dev-down
dev-down:
	$(COMPOSE_DEV) down

## ── Status ──────────────────────────────────────────────────
.PHONY: ps
ps:
	$(COMPOSE) ps

## ── Clean ───────────────────────────────────────────────────
.PHONY: clean
clean:
	$(COMPOSE) down -v --rmi all --remove-orphans
	@echo "🧹  All Docker resources for this project removed."

## ── Rebuild (no cache) ──────────────────────────────────────
.PHONY: rebuild
rebuild:
	$(COMPOSE) build --no-cache --parallel
	$(COMPOSE) up -d
