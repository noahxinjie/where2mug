# Where2Mug

A full-stack application for discovering and sharing study spots. Built with FastAPI backend and React frontend.

## Features

- **Study Spot Management**: Create, view, and manage study spots
- **User System**: Registration for students and business owners
- **Review System**: Rate and review study spots
- **Interactive Map**: Visualize study spots on a map
- **Modern UI**: Responsive design with Tailwind CSS

## Project Structure

```
where2mug/
├── app/                    # FastAPI backend
│   ├── core/              # Configuration
│   ├── db/                # Database setup
│   ├── models/            # SQLAlchemy models
│   ├── routes/            # API routes
│   ├── schemas/           # Pydantic schemas
│   └── main.py            # FastAPI app
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── types/        # TypeScript types
│   └── package.json
└── requirements.txt       # Python dependencies
```

## Quick Start

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/where2mug.git
   cd where2mug_backend
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server**

   ```bash
   uvicorn app.main:app --reload --host localhost --port 8000
   ```

   Access the API documentation at: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

   The frontend will be available at: http://localhost:3000

## API Endpoints

- `GET /api/v1/studyspots/` - List all study spots
- `POST /api/v1/studyspots/` - Create a new study spot
- `POST /api/v1/studyspots/${id}` - Retrieve study spot details based on id
- `GET /api/v1/users/` - List all users
- `POST /api/v1/users/` - Create a new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/reviews/` - List all reviews
- `POST /api/v1/reviews/` - Create a new review
- `GET /api/v1/reviews/by-spot/${spotId}` - List all reviews for a study spot


## Tech Stack

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL/SQLite
- Pydantic

### Frontend

- React 18 with TypeScript
- Tailwind CSS
- React Router
- React Leaflet
- Axios

## Development

Make sure both the backend and frontend are running simultaneously for full functionality.
