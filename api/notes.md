# notes

useful for resetting the database:
```js
mongoose.connection.collections['user'].drop(function (err) {
    console.log('collection dropped');
});
// db.dropDatabase();
```