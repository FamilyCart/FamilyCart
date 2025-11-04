# FamilyCart

A responsive single-page Angular web application integrated with Django REST Framework APIs.

## Features

- ✅ Fully responsive design for all devices (mobile, tablet, desktop)
- ✅ Mobile-first approach with breakpoints for different screen sizes
- ✅ Django REST Framework API integration ready
- ✅ Modern Angular 17 architecture with standalone components
- ✅ HTTP client service for API calls
- ✅ Environment configuration for different environments

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (will be installed locally)

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

## API Configuration

Update the API URL in the environment files:

- **Development**: `src/environments/environment.ts`
- **Production**: `src/environments/environment.prod.ts`

By default, the API URL is set to `http://localhost:8000/api` (typical Django development server).

## Using the API Service

The `ApiService` is available throughout the application. Here's how to use it:

```typescript
import { ApiService } from './services/api.service';

constructor(private apiService: ApiService) {}

// GET request
this.apiService.get('products/').subscribe({
  next: (data) => console.log(data),
  error: (error) => console.error(error)
});




```

### With Authentication Token

If your Django REST API requires authentication:

```typescript
const token = 'your-auth-token';
this.apiService.get('protected-endpoint/', null, token).subscribe(...);
```

## Responsive Breakpoints

The application uses the following breakpoints:

- **Mobile**: Default (320px+)
- **Small devices**: 576px+
- **Medium devices** (tablets): 768px+
- **Large devices** (desktops): 992px+
- **Extra large devices**: 1200px+
- **XXL devices**: 1400px+

## Build

Build for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/family-cart` directory.

## Project Structure

```
FamilyCart/
├── src/
│   ├── app/
│   │   ├── home/              # Home component
│   │   ├── services/          # API service and other services
│   │   ├── models/            # TypeScript interfaces/models
│   │   ├── app.component.*    # Root component
│   │   ├── app.config.ts      # Application configuration
│   │   └── app.routes.ts      # Routing configuration
│   ├── assets/                # Static assets
│   ├── environments/          # Environment configurations
│   ├── styles.scss            # Global styles
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```
