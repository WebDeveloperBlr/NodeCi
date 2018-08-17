FROM node:carbon

WORKDIR /usr/src/app

RUN npm install -g nodemon
#RUN npm install -g typescript
#RUN npm install -g ts-node

COPY . .

WORKDIR /usr/src/app/

#COPY ./backend/package*.json .

RUN npm install

#WORKDIR /usr/src/app

WORKDIR /usr/src/app/client

#COPY ./frontend/package*.json .

RUN npm install

WORKDIR /usr/src/app
# If you are building your code for production
# RUN npm install --only=production

EXPOSE 5000

CMD [ "npm", "start" ]