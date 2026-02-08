FROM python:3.13-slim

ENV PORT=7860

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user

USER user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

COPY --chown=user requirements.txt requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN python -c "from rembg import new_session; new_session('u2net')"

COPY --chown=user . $HOME/app

EXPOSE ${PORT}

CMD ["/bin/sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port $PORT"]
