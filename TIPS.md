# 💡 Quick Tips

## Fast Setup
```bash
#start everything quickly
docker-compose up --build -d

#check if running
curl http://localhost:8000/api/health
```

## Testing Incidents
```bash
#trigger cpu spike
curl -X POST http://localhost:8000/api/incidents/trigger \
  -H "Content-Type: application/json" \
  -d '{"incident_id": "cpu_spike"}'

#check metrics
curl http://localhost:8000/api/metrics
```

## Useful URLs
- Dashboard: http://localhost:8000
- API Docs: http://localhost:8000/docs  
- Health Check: http://localhost:8000/api/health

## Troubleshooting
- If AI not working: `docker-compose restart ollama`
- If port busy: `docker-compose down` then try again
- Check logs: `docker-compose logs dashboard` 