### The secrets folder
Here is where all config details are kept. At the moment, it contains just one file, `database.js`, which looks like this:

```javascript
module.exports = {
  url: 'mongodb://username:password@IP:PORT/DbName'
}
```

To get started, create this file and populate it with your database credentials. 