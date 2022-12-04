const dbConnection = require('./mongoConnection');

/* This will allow us to have one reference to each collection per app */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection.dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Collections used throughout Spotterfy to store user data/logins, reservation info, hotspots, etc. */
module.exports = {
  users: getCollectionFn('users'),
  hotspots: getCollectionFn('hotspots')
};
