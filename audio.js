class Audio {
  constructor (url) {
    this.timestamp = Date.now()
    this.url = url
    this.text = null
  }

  async fetchText () {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.text = 'Mock Text, waiting for the implementation of speech to text'
        resolve()
      }, 5000)
    })
  }
}

module.exports = Audio
