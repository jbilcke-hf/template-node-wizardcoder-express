FROM python:latest

ENV PYTHONUNBUFFERED 1

EXPOSE 7860

RUN apt update

RUN apt install curl

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN apt install nodejs

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

COPY --chown=user package*.json .

RUN npm install

COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY --chown=user . .

CMD [ "npm", "run", "start" ]