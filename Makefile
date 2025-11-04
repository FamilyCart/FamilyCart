# ================================
# FamilyCart Development Makefile
# ================================

# Default service names (edit if different)
COMPOSE_FILE=docker-compose.yml
BACKEND_SERVICE=backend
FRONTEND_SERVICE=frontend
DB_SERVICE=db

# ----------------
# 🏁 Basic Commands
# ----------------

up:
	@echo "🚀 Starting FamilyCart stack (frontend + backend + db)..."
	docker compose -f $(COMPOSE_FILE) up --build

down:
	@echo "🛑 Stopping all containers..."
	docker compose -f $(COMPOSE_FILE) down

rebuild:
	@echo "🔄 Rebuilding containers without cache..."
	docker compose -f $(COMPOSE_FILE) build --no-cache

restart:
	@echo "♻️ Restarting all services..."
	docker compose -f $(COMPOSE_FILE) down
	docker compose -f $(COMPOSE_FILE) up --build

# ----------------
# 🐍 Django Helpers
# ----------------

migrate:
	@echo "📦 Running Django migrations..."
	docker compose exec $(BACKEND_SERVICE) python manage.py migrate

createsuperuser:
	@echo "👤 Creating Django superuser..."
	docker compose exec $(BACKEND_SERVICE) python manage.py createsuperuser

collectstatic:
	@echo "📁 Collecting static files..."
	docker compose exec $(BACKEND_SERVICE) python manage.py collectstatic --noinput

shell:
	@echo "💻 Opening Django shell..."
	docker compose exec $(BACKEND_SERVICE) python manage.py shell

logs-be:
	@echo "📜 Backend logs:"
	docker compose logs -f $(BACKEND_SERVICE)

# ----------------
# 🌐 Frontend Helpers
# ----------------

logs-fe:
	@echo "📜 Frontend logs:"
	docker compose logs -f $(FRONTEND_SERVICE)

npm-install:
	@echo "📦 Installing frontend dependencies inside container..."
	docker compose exec $(FRONTEND_SERVICE) npm install

# ----------------
# 🗑️ Cleanup
# ----------------

clean:
	@echo "🧹 Removing containers, networks, and dangling images..."
	docker compose -f $(COMPOSE_FILE) down -v --rmi local
	docker system prune -f

