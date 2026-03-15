FROM python:3.14-slim

ENV PORT=7860

RUN apt-get update && apt-get install -y --no-install-recommends \
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

COPY --chown=user src/download_model.py src/download_model.py

COPY --chown=user src/config.py src/config.py

ARG MODEL_NAME=u2net

ENV MODEL_NAME=${MODEL_NAME}

RUN python src/download_model.py

COPY --chown=user . $HOME/app

EXPOSE ${PORT}

CMD ["/bin/sh", "-c", "exec uvicorn src.main:app --host 0.0.0.0 --port $PORT"]
