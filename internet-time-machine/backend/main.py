import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    # Railway assigns a dynamic port using the PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
