const Telegraf = require('telegraf')
const express = require('express')
const cors = require('cors')
const app = express()

const DB = require('./db')
const User = require('./user')
const Audio = require('./audio')

const validCPF = require('./cpf')

const PORT = process.env.PORT || 5000

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
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

app.post('/token/generate', (req, res) => {
  const { cpf } = req.query
  const user = db.getUser(cpf, 'cpf')

  if (user) {
    user.generateToken()
    bot.telegram.sendMessage(user.id, `Seu token de verificação é: ${user.token}`)

    res.sendStatus(200)
    res.end()
  } else {
    res.sendStatus(404)
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
      res.sendStatus(401)
      res.end()
    }

  } else {
    res.sendStatus(401)
    res.end()
  }
})

app.get('/debug/db', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(db))
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

        ctx.reply(` Bem vindo(a) ao Minha Cuca!
          Para criar uma nova memória, peça para o seu médico gravar um áudio informando:
          1. Nome e CRM Médico
          2. Toda sua Anamnese (exames solicitados e resultados, hipótese de diagnóstico, diagnóstico, tratamento e medicamentos).
          Ajude o Minha Cuca ficar cada vez mais confiável e evite áudios com interrupções.

          Caso queira consultar tudo o que o Minha Cunha já guardou, acesse https://minhacuca.herokuapp.com e informe seu CPF. Te enviaremos um código de validação para acesso. 
          Ah, se você preferir o médico também pode acessar o site desde que você compartilhe o código que passaremos para você!!

          Pronto! Você não está mais sozinho, Minha Cuca guardará suas consultas na memória :D `)
      }
      break;

    default:
      const user = db.getUser(id)

      if (!user.hasCPF && validCPF(text)) {
        user.setCPF(text)
        ctx.reply('CPF registrado com sucesso!')
        await delay(1000)
        ctx.reply('Agora você pode acessar suas memorias no link: https://minhacuca.herokuapp.com')
      } else if (user.hasCPF && validCPF(text)) {
        ctx.reply('Parece que você já registrou um CPF.')
      }
      break;
  }
})

bot.on('voice', async ctx => {
  ctx.reply('Recebemos o áudio e já estamos criando uma nova memória, espera só mais um pouquinho...')

  const id = ctx.message.from.id
  const user = db.getUser(id)
  const fileId = ctx.message.voice.file_id
  const fileLink = await bot.telegram.getFileLink(fileId)

  const audio = new Audio(fileLink)
  await audio.fetchText()

  user.addAudio(audio)

  if (!user.hasCPF) {
    ctx.reply('Para criarmos a memória, falta só nos dizer quem é você, pode nos passar seu CPF?')
    await delay(2000)
    ctx.reply('Fique tranquilo, nas próximas consultas já nos conheceremos!')
  }
  else {
    ctx.reply('Memória criada com sucesso!! Até a próxima consulta!')
  }
})

// BOOTSTRAP
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}, YAYAY!`)
  bot.launch()
})
