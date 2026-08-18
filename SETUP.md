# Credential Setup Guide

This project uses environment-specific configuration files to keep sensitive credentials out of the repository. Follow these steps to set up your local development environment.

## Backend Setup (ASP.NET Core)

### Step 1: Create your local configuration

Copy the example file and update it with your actual credentials:

```bash
cd Backend/StudentResultSystem/StudentResultSystem
cp appsettings.example.json appsettings.Development.json
```

### Step 2: Update the credentials in `appsettings.Development.json`

Replace the placeholder values with your actual database and JWT settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3306;database=srms;user=your_db_user;password=your_db_password"
  },
  "JwtSettings": {
    "SecretKey": "your_jwt_secret_key_minimum_32_characters_long",
    "Issuer": "StudentResultSystem",
    "Audience": "StudentResultSystemUsers",
    "ExpiryMinutes": 60
  }
}
```

**Important:**
- The JWT SecretKey must be at least 32 characters long for security
- Use strong passwords for your database connection
- Never commit `appsettings.Development.json` to the repository

### Step 3: Production deployment

For production, create `appsettings.Production.json` with your production credentials:

```bash
cp appsettings.example.json appsettings.Production.json
```

Update the values with your production database and JWT settings. This file is also gitignored.

## Frontend Setup (Angular)

### Step 1: Create your local environment file

Copy the example file and update it with your backend API URL:

```bash
cd Frontend/SRMS/src/environments
cp environment.example.ts environment.ts
cp environment.example.ts environment.prod.ts
```

### Step 2: Update the API URLs

In `environment.ts` (development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'  // Your local backend URL
};
```

In `environment.prod.ts` (production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'  // Your production API URL
};
```

### Step 3: Verify the build

```bash
cd Frontend/SRMS
npm run build
```

The build should complete successfully with your environment configuration.

## Git Protection

The following files are automatically ignored by Git (see `.gitignore`):

- `**/appsettings.Development.json` - Backend development credentials
- `**/appsettings.Production.json` - Backend production credentials  
- `**/appsettings.Staging.json` - Backend staging credentials
- `**/src/environments/environment.ts` - Frontend development config
- `**/src/environments/environment.prod.ts` - Frontend production config

Only the example files (`appsettings.example.json` and `environment.example.ts`) are committed to the repository as templates.

## Security Best Practices

1. **Never commit credentials** - The .gitignore rules prevent accidental commits
2. **Use strong secrets** - JWT keys should be random and at least 32 characters
3. **Different environments** - Use different credentials for dev/staging/production
4. **Rotate secrets regularly** - Change JWT keys and database passwords periodically
5. **Environment variables** - For production, consider using environment variables instead of config files

## Troubleshooting

### Backend won't start
- Ensure `appsettings.Development.json` exists in the API project folder
- Verify the database connection string is correct
- Check that MySQL is running and accessible

### Frontend API calls failing
- Verify `environment.ts` has the correct backend URL
- Check that the backend is running and CORS is configured
- Ensure the API URL includes the `/api` suffix

### Build errors
- Make sure both `environment.ts` and `environment.prod.ts` exist
- Verify the TypeScript syntax is correct
- Check that the apiUrl is a valid string
