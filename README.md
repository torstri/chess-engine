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
# Use the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project
COPY . .

# Expose the port
EXPOSE 5000

# Start the backend
CMD ["npm", "start"]
```
### Frontend (frontend/Dockerfile)
Create a Dockerfile for the frontend

dockerfile:
```
# Use Node.js as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Build the frontend (React example)
RUN npm run build

# Use nginx to serve the frontend
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# Expose port 80 for serving the app
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
      - "5000:5000"
    environment:
      - NODE_ENV=production
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

Ensure that your frontend correctly communicates with the backend. If the frontend makes API requests, update fetch or axios calls:

```Typescript
const API_URL = process.env.REACT_APP_API_URL || "http://backend:5000";
fetch(`${API_URL}/api/data`)
```
Then, in frontend/.env:

```Typescript
REACT_APP_API_URL=http://backend:5000

```


