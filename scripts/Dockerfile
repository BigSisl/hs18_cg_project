FROM debian:stretch

ENV WORLDENGINE_VERSION 0.19.0

RUN apt-get update && \
    apt-get -y install git \
    procps \
    python-dev \
    python-pip \
    curl \
    vim

RUN pip install --upgrade pip setuptools

RUN mkdir -p /app \
    && curl -SL "https://github.com/Mindwerks/worldengine/archive/v${WORLDENGINE_VERSION}.tar.gz" \
    | tar xvz -C /app --strip-components=1 \
    && cd /app \
    && pip install -r /app/requirements-dev.txt

WORKDIR /app
