FROM nginx:alpine

# Copy the custom, highly-optimized Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static project files into the default serve directory
COPY . /usr/share/nginx/html/

# Expose port 80 to be mapped by Coolify/Docker
EXPOSE 80
