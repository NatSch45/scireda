# Scireda API

## Start project in local/development mode

To start the Scireda API, first use the command below to **import all necessary dependencies** :

```
npm install
```

Then, if it is not already done, you'll need to **run the migrations** to build the structure of your database.
Use the command below :

```
node ace migration:run
```

Finally, you can **run the server** by using this command :

```
node ace serve
```
