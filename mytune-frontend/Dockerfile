FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose React dev server port
EXPOSE 3000

# Start the React app
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
