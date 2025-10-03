FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . /app/

# Expose React dev server port
EXPOSE 3000

# Start React in development mode, bind to 0.0.0.0
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
