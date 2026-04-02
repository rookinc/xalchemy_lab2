pkill -f uvicorn 2>/dev/null
sleep 0.5
uvicorn app:app --reload --host 0.0.0.0 --port 8000
