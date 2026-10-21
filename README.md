# groceries-web-ui

a simple website written in Vue.js for tracking grocery stock.

### setup and deployment

if you haven't already, set up an instance of the [API](https://github.com/skrungly/groceries-api).

clone this repository and make a copy of `.env` with your config edits:

```sh
$ git clone https://github.com/skrungly/groceries-web-ui.git
$ cd groceries-web-ui
$ cp .env .env.local
$ nano .env.local
```

to launch the frontend web server, you can simply run:

```sh
$ docker compose up --build -d
```
