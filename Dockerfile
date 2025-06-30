# Dockerfile pour Cloud Monitoring Dashboard
FROM python:3.11-slim

WORKDIR /app

# Copie du backend
COPY cloud_monitoring_dashboard/backend/ ./backend/
COPY cloud_monitoring_dashboard/frontend/ ./frontend/
COPY templates/ ./templates/

# Dépendances Python
RUN pip install --no-cache-dir -r backend/requirements.txt

EXPOSE 8000

CMD ["python", "backend/main.py"] 