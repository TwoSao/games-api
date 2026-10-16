const express = require('express')
const app = express()
const port = 8080
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./docs/swagger.yaml')

app.use(express.json())

const games = [
    {id: 1, name: "Witcher 3", price: 29.99},
    {id: 2, name: "Cyberpunk 2077", price: 59.99},
    {id: 3, name: "Minecraft", price: 26.99},
    {id: 4, name: "Counter-Strike: Global Offensive", price: 0},
    {id: 5, name: "Roblox", price: 0},
    {id: 6, name: "Grand Theft Auto V", price: 29.99},
    {id: 7, name: "Valorant", price: 0},
    {id: 8, name: "Forza Horizon 5", price: 59.99}
]

// Вспомогательная функция для получения базового URL сервера
const getBaseUrl = (req) => {
    return req.protocol + '://' + req.get('host')
}

app.get('/games', (req, res) => {
    res.send(games)
})

app.get('/games/:id', (req, res) => {
    if (typeof games[req.params.id - 1] === 'undefined') {
        return res.status(404).send({ error: "Game not found" })
    }
    res.send(games[req.params.id - 1])
})

// POST /games с валидацией и полным URL в заголовке Location
app.post('/games', (req, res) => {
    // Валидация: проверяем наличие имени и цены
    if (!req.body.name || !req.body.price) {
        return res.status(400).send({ error: "One or more required fields are missing" })
    }

    // Создаем объект игры
    const createdGame = {
        id: games.length + 1,
        name: req.body.name,
        price: req.body.price
    }

    // Добавляем игру в массив
    games.push(createdGame)

    // Формируем ответ с кодом 201 Created, заголовком Location и объектом игры
    res.status(201)
        .location(`${getBaseUrl(req)}/games/${createdGame.id}`)
        .send(createdGame)
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`)
})