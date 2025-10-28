# MGDC Backend

## Quick start

1. Install dependencies (run once):
```
npm install
```
2. Start server:
```
npm run start
```
3. Seed demo data (student, fee, attendance):
```
npm run seed
```

Ensure MongoDB is running and `MONGO_URI` is set in `.env` if not using the default.

## REST Client
Use `backend/requests.http` in VS Code with the REST Client extension.

## Postman
Import `backend/docs/attendance.postman_collection.json` or `backend/docs/postman_collection.json`.
