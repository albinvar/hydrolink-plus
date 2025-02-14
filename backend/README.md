# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.43. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Docker

To build the Docker image:

```bash
docker build --no-cache -t hydrolink-backend .
```

To run the Docker container:

```bash
docker run -p 6767:6767 --env-file .env --name hydrolink_backend hydrolink-backend
```
