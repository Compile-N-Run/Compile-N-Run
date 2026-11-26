FROM node:24 AS dev

WORKDIR /app

# Install pnpm via corepack
RUN corepack enable

# Copy package files first for layer caching
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the Docusaurus dev server port
EXPOSE 3002

# Start the development server
CMD ["pnpm", "start"]