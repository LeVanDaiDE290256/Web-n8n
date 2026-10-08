# Static frontend for the Web n8n AI Chat demo.
FROM nginx:1.27-alpine

# Replace the default Nginx page with this project's static files.
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY js /usr/share/nginx/html/js

EXPOSE 80
