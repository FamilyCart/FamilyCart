# ================================
# Angular Development Container
# ================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose Angular’s dev server port
EXPOSE 4200

# Default command to start Angular dev server with live reload
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
