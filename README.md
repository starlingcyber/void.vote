## Development

Set the `DATABASE_URL` to point to the database compiled by `pindexer`, then run the dev server:

```shellscript
npm run dev
```

Chrome only allows Prax to connect on secure origins. To create an https endpoint, install Caddy and run `caddy run` to proxy `https://localhost` to the `dev` service. This may require installing certs to your machine's root store.
