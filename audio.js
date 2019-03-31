class Audio {
  constructor (url) {
    this.timestamp = Date.now()
    this.url = url
    this.text = null
  }

  async fetchText () {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.text = 'Texto mocado pra caralho'
        resolve('Texto mocado pra caralho')
      }, 5000)
    })
  }
}

module.exports = Audio
