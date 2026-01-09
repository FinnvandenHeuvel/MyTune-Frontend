FROM node:18

WORKDIR /app

# Create a non-root user and group
RUN groupadd -r app && useradd -r -g app app

# Copy only package files first (cache-friendly)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project (still needs .dockerignore)
COPY . .

# Fix permissions for the non-root user
RUN chown -R app:app /app

# Switch to non-root
USER app

EXPOSE 3000

# CRA dev server should listen on all interfaces
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
