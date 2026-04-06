# Deployment Checklist

## Backend

1. Copy `backend/.env.example` to `backend/.env` and provide real production values.
2. Use a cloud-hosted MongoDB connection string in `MONGO_URI`.
3. Set `CLIENT_URL` to the exact production frontend URL. Multiple origins can be provided as a comma-separated list.
4. Use a strong `JWT_SECRET` with at least 32 characters.
5. Install production dependencies with `npm ci --omit=dev`.
6. Run `npm test` inside `backend` for a syntax smoke check before deployment.
7. Start the API with `npm start`.

## Frontend

1. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` to the deployed API base URL.
2. Install dependencies with `npm ci`.
3. Build with `npm run build`.
4. Serve the generated `frontend/dist` folder from your hosting provider.

## Infrastructure

1. Provision HTTPS for the frontend and backend.
2. Store real secrets only in your hosting provider's environment variable manager.
3. Rotate any secrets that may have been committed before this cleanup.
4. Verify the production frontend origin is accepted by CORS.
5. Confirm uploads and logs are backed by persistent storage if your host uses ephemeral containers.
6. Move product image uploads to object storage such as S3, Cloudinary, or an equivalent managed service before scaling beyond a single server.
7. Add a Dockerfile or platform-specific process definition if your deployment target requires containerized builds.
