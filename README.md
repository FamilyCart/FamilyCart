
# 🛒 FamilyCart

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

**FamilyCart** is a full-stack web application for managing a single-family grocery list.  
It features a **Django REST Framework backend**, an **Angular frontend**, and **Docker-based deployment** for seamless setup and scalability.

---

## ⚙️ Prerequisites

- **Docker** – [Install Docker](https://docs.docker.com/get-docker/)  
- **Docker Compose** – Included with Docker Desktop  
- **Make** – Usually pre-installed on macOS/Linux  
  - Windows: [Install Make](https://gnuwin32.sourceforge.net/packages/make.htm)  

Verify your installation:

```bash
docker --version
docker compose version
make --version
````

---

## 📁 Project Structure

```bash
FamilyCart/
├── docker-compose.yml
├── Makefile
├── familycart-be/
│   ├── constants/          # Global constants and config values
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env                # Environment configuration
│   ├── family/             # Family APP Logic Management
│   ├── familycart/         # Django project settings
│   ├── grocery/            # Grocery APP Logic Management
│   ├── manage.py           # Django management utility
│   ├── notification/       # Notification service
│   ├── README.md
│   ├── requirements/       # Python dependencies
│   ├── templates/          # HTML templates (if any)
│   ├── user/               # User authentication and profile management
│   └── venv/               # Python virtual environment (local only)
├── familycart-fe/
│   ├── angular.json        # Angular CLI configuration
│   ├── dist/               # Compiled build output
│   ├── Dockerfile
│   ├── nginx.conf          # Nginx config
│   ├── node_modules/       # Node dependencies
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── src/                # Angular source files
│   ├── tsconfig.app.json
│   └── tsconfig.json
```

---

## 🚀 Quick Start (with Docker)

### Start all services

```bash
make up
```

* Builds and starts **frontend**, **backend**, and **database** containers
* Application accessible at:

  * Frontend → [http://localhost:4200](http://localhost:4200)
  * Backend API → [http://localhost:8000](http://localhost:8000)

### Stop all services

```bash
make down
```

### Rebuild containers

```bash
make rebuild
```

### Restart services

```bash
make restart
```

---

## 🐍 Backend Commands

```bash
make migrate           # Apply Django migrations
make createsuperuser   # Create Django admin user
make collectstatic     # Collect static files
make shell             # Open Django shell
make logs-be           # View backend logs
```

---

## 🌐 Frontend Commands

```bash
make logs-fe           # View frontend logs
make npm-install       # Install frontend dependencies
```

---

## 🗑️ Cleanup

```bash
make clean             # Remove all containers, networks, and images
```

---

## 📝 Sample `.env` Configuration

### Backend (`familycart-be/.env`)

```env
SECRET_KEY=your_secret_key
DEBUG=True

APP_NAME=familycart

SYS_ENV=development

ALLOWED_HOSTS=*
ALLOWED_HOST=*
CORS_ORIGIN_WHITELIST=http://127.0.0.1:8000,http://localhost:4200
CORS_ALLOWED_ORIGINS=http://localhost:4200
DATABASE_URL=postgresql://postgres:java@localhost:5432/familycart

# Email Config
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=youremail@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh hijk lmnop


FRONTEND_URL=http://localhost:3000/

DJANGO_SETTINGS_MODULE=familycart.settings.settings

# Static and media
STATIC_ROOT=/app/staticfiles
MEDIA_ROOT=/app/media

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=familycart_db
DB_USER=familyuser
DB_PASSWORD=familypass
DB_HOST=db
DB_PORT=5432
```


> Update these values according to your environment before starting the containers.

---

## 🧠 Future Enhancements

* Multi-user and family sharing support
* Real-time updates via WebSockets
* Push notifications for grocery reminders
* Cloud deployment with CI/CD pipelines
* Role-based user access (Admin/Member)

---

## 🪣 Command Reference

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `make up`              | Start all services (frontend + backend + DB) |
| `make down`            | Stop all running containers                  |
| `make rebuild`         | Rebuild containers without cache             |
| `make restart`         | Restart all services                         |
| `make migrate`         | Apply Django migrations                      |
| `make createsuperuser` | Create Django admin user                     |
| `make collectstatic`   | Collect static files                         |
| `make logs-be`         | Show backend logs                            |
| `make logs-fe`         | Show frontend logs                           |
| `make npm-install`     | Install frontend dependencies                |
| `make clean`           | Clean all containers and images              |

---

## 🧾 License

Created by **Ravinkumar Rakholiya**
© 2025 – FamilyCart 

```
