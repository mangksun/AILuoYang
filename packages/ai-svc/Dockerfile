FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple \
    PIP_TRUSTED_HOST=pypi.tuna.tsinghua.edu.cn

COPY packages/ai-svc/pyproject.toml ./

RUN pip install --no-cache-dir .

COPY packages/ai-svc/app ./app
COPY packages/ai-svc/demo.py ./demo.py

EXPOSE 3010

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3010"]
