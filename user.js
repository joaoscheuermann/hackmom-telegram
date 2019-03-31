function sequence (length) {
  let text = "";
  let possible = "0123456789";

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text
}

class User {
  constructor (id) {
    this.id = id
    this.cpf = null
    this.token = null
    this.auth = null
    this.audios = []
  }

  addAudio (audio) {
    this.audios.push(audio)
  }

  generateToken () {
    this.token = `${sequence(3)} ${sequence(3)}`
  }

  generateAuthKey () {
    this.auth = ''
  }

  clearToken () {
    this.token = null
  }

  resetToken () {
    this.token = this.generateToken()
  }

  get hasCPF () {
    return this.cpf !== null
  }

  setCPF (cpf) {
    if (!this.hasCPF) this.cpf = cpf
  }
}

module.exports = User