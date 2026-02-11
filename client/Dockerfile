FROM node:22-alpine

WORKDIR /client

COPY . .
COPY .env .env

RUN npm install

EXPOSE 5173

# CMD ["npm", "run", "dev"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 
# docker run -p 5173:5173 -v "$(pwd):/app" -v /app/node_modules -it drs_client
# docker run -p 5173:5173 drs_client
