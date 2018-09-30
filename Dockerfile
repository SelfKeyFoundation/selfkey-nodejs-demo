FROM node:9
RUN mkdir /home/btrade
RUN chmod 755 /home/btrade
COPY . /home/btrade
WORKDIR /home/btrade
RUN npm i
EXPOSE 3000
CMD ["node", "app.js"]