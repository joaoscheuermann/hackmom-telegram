class DB {
  constructor () {
    this.db = []
  }

  addUser (user) {
    this.db.push(user)
    return
  }

  hasUser (id) {
    return this.db.some(user => user.id === id)
  }

  getUser (id, key = 'id') {
    return this.db.find(user => user[key] === id)
  }
}

module.exports = DB
