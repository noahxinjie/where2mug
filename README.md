A simple **FastAPI** backend for Where2Mug

---

Quick start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/where2mug_backend.git
cd where2mug_backend
```

### 2. Create a virtual / conda environment (optional)
e.g.,
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
Refer to ```.env_sample``` for what variables you will need.

### 5. Run the FastAPI server
e.g., (you can use whatever port you like)
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Afterward, you can access and test the API endpoints by going to ```http://127.0.0.1:8000/docs```