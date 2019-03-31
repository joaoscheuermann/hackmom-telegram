const Telegraf = require('telegraf')
var express = require('express')
var app = express()

const DB = require('./db')
const User = require('./user')
const Audio = require('./audio')

const validCPF = require('./cpf')

const bot = new Telegraf('808113020:AAE4_OaWucE6RDwkbb8XtU6iDbEt1adGIW0')
const db = new DB()

function delay (delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, delay)
  })
}

// EXPRESS JS
app.post('/token/generate', (req, res) => {
  const { cpf } = req.query
  const user = db.getUser(cpf, 'cpf')

  if (user) {
    user.generateToken()
    bot.telegram.sendMessage(user.id, `Seu token de verificação na plataforma é: ${user.token}`)

    res.sendStatus(200)
    res.end()
  } else {
    res.sendStatus(300)
    res.end()
  }
})

app.post('/token/validate', (req, res) => {
  const { cpf, token } = req.query
  const user = db.getUser(cpf, 'cpf')

  if (user) {
    if (token === user.token) {
      bot.telegram.sendMessage(user.id, `Você conectou em uma nova maquina`)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(user))
    } else {
      res.sendStatus(300)
      res.end()
    }

  } else {
    res.sendStatus(300)
    res.end()
  }
})

// BOT
bot.catch((err) => {
  console.log('Ooops')
})

bot.on('text', async ctx => {
  const id = ctx.message.from.id
  const text = ctx.message.text

  switch (text) {
    case '/start':
      if (!db.hasUser(id)) {
        db.addUser(new User(id))

        ctx.reply('Bem vindo ao Minha Cuca .... {{ Instruções de uso }}')
      }
      break;

    default:
      const user = db.getUser(id)

      if (!user.hasCPF && validCPF(text)) {
        user.setCPF(text)
        ctx.reply('CPF registrado com sucesso!')
        await delay(1000)
        ctx.reply('Agora você pode acessar nossa plataforma no link: {{link}} e ter acesso a todos os seus dados.')
      } else if (user.hasCPF && validCPF(text)) {
        ctx.reply('Parece que você já registrou um CPF.')
      }
      break;
  }
})

bot.on('voice', async ctx => {
  ctx.reply('Estamos processando seu audio, é só aguardar um pouquinho que ele estará disponivel em nossa plataforma.')

  const id = ctx.message.from.id
  const user = db.getUser(id)
  const fileId = ctx.message.voice.file_id
  const fileLink = await bot.telegram.getFileLink(fileId)

  const audio = new Audio(fileLink)
  await audio.fetchText()

  user.addAudio(audio)
  if (!user.hasCPF) {
    ctx.reply('Prontinho! Parece que você não registrou seu CPF, assim você não podera acessar nossa plataforma :(')
    await delay(5000)
    ctx.reply('Lá voce tem um monte de vantagens {{ valores }}')
    await delay(2000)
    ctx.reply('Basta digitar o seu CPF, e logo depois você receberá o link para acessar a plataforma.')
  }
  else {
    ctx.reply('Prontinho! Seu audio já está disponivel na plataforma :) {{ link }}')
  }
})

// BOOTSTRAP
app.listen(8080, () => {
  console.log('Listening on 8080')
  bot.launch()
})
