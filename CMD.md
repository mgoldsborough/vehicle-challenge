
Example curl command

```
curl -X POST \
  -d '{"startDate":"2023-12-13T00:02:00Z", "endDate":"2023-12-14T17:59:51Z","vehicleId":"sprint-3"}' \
  -H "Content-Type: application/json" \
  "http://localhost:3000/search"
```