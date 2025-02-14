# chess-engine

## Commands
### Install Dependencies
Before running the project, ensure all dependencies are installed. Run the following command in the root directory of the project:
```
npm install
```

### Run the Development Server
```
npm run dev
```

### Jest
Run the following command to run all tests
```
npm test
```

## Evaluation of Game State
The program evaluates a game state based on four aspects:
1. Material difference
2. Positioning of pieces
3. Mobility of pieces
4. King positions

1. and 2. are calculated using PSTs and piece values.
``` typescript
export function materialEvaluation(game: Chess, player: Color): number
```
---

# Set up Docker Compose to manage FE and BE
## 1. Create a Docker Network (Optional)
Docker Compose will handle networking automatically, but if running standalone containers, create a network:
```
docker network create fullstack-network
```
## 2. Set Up Docker for Frontend and Backend
### Backend (backend/Dockerfile)
Create a Dockerfile for the backend

dockerfile:
```
# Use Golang image
FROM golang:1.21 AS builder

# Set working directory
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the application source code
COPY . .

# Build the Go application
RUN go build -o main .

# Use a lightweight image for production
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .

# Expose the port
EXPOSE 8080

# Run the application
CMD ["./main"]

```
### Frontend (frontend/Dockerfile)
Create a Dockerfile for the frontend

dockerfile:
```
# Use Node.js for building the React app
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the React application
RUN npm run build

# Use Nginx for serving the frontend
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for serving the frontend
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

```
## 3. Create a docker-compose.yml File
Create a ```docker-compose.yml``` in the root:
```
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    networks:
      - app-network

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

```
## 4. Update the Frontend to Use the Backend

Ensure that your frontend correctly communicates with the backend. If the frontend makes API requests, update fetch or axios calls. 
In your ../src/config.ts:

```Typescript
const API_URL = process.env.REACT_APP_API_URL || "http://backend:8080";
fetch(`${API_URL}/api/data`)
```
Then, in frontend/.env:

```Typescript
REACT_APP_API_URL=http://backend:8080

```

## 5. Build and Run

Run the following command in the root directory
```
docker-compose up --build
```

This will:

- Build both frontend and backend Docker images
- Start the services
- Set up networking so the frontend can communicate with the backend

## 6. Stop Containers

```
docker-compose down
```

