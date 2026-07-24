# Use a lightweight, stable Node environment
FROM node:24-slim

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy your source code
COPY . .

# Document that Vite / Create React App listens on port 3000
EXPOSE 3000

# Start the frontend development server
CMD ["npm", "start"]
