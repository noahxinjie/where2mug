# Where2Mug Frontend

A modern React frontend for the Where2Mug study spot finder application.

## Features

- **Study Spot Discovery**: Browse and search for study spots
- **Interactive Map**: View study spots on an interactive map
- **Add New Spots**: Submit new study spots to the community
- **User Registration**: Create accounts for students and business owners
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Leaflet for maps
- Axios for API calls
- Heroicons for icons

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## API Integration

The frontend connects to the FastAPI backend running on `http://localhost:8000`. Make sure the backend is running before starting the frontend.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── StudySpotList.tsx  # Main study spots listing
│   ├── StudySpotCard.tsx  # Individual spot card
│   ├── StudySpotMap.tsx   # Interactive map component
│   ├── AddStudySpot.tsx   # Add new spot form
│   └── UserRegistration.tsx # User registration form
├── services/           # API service layer
│   └── api.ts         # Axios configuration and API calls
├── types/             # TypeScript type definitions
│   └── index.ts       # Application types
└── App.tsx            # Main application component
```
