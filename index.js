const express = require('express')
const app = express()
const port = 8080
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./docs/swagger.yaml')

app.use(express.json())

const games = [
    { id: 1, name: "Witcher 3", price: 29.99 },
    { id: 2, name: "Cyberpunk 2077", price: 59.99 },
    { id: 3, name: "Minecraft", price: 26.99 },
    { id: 4, name: "Counter-Strike: Global Offensive", price: 0 },
    { id: 5, name: "Roblox", price: 0 },
    { id: 6, name: "Grand Theft Auto V", price: 29.99 },
    { id: 7, name: "Valorant", price: 0 },
    { id: 8, name: "Forza Horizon 5", price: 59.99 }
]

// Глобальный счетчик для генерации уникальных ID
let nextId = games.length > 0 ? Math.max(...games.map(g => g.id)) + 1 : 1

// Вспомогательная функция для получения базового URL сервера
const getBaseUrl = (req) => {
    return req.protocol + '://' + req.get('host')
}

app.get('/games', (req, res) => {
    res.send(games)
})

app.get('/games/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
        return res.status(400).send({ error: "Invalid ID format" })
    }

    const game = games.find(g => g.id === id)
    if (!game) {
        return res.status(404).send({ error: "Game not found" })
    }

    res.send(game)
})

app.delete('/games/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
        return res.status(400).send({ error: "Invalid ID format" })
    }

    const index = games.findIndex(g => g.id === id)
    if (index === -1) {
        return res.status(404).send({ error: "Game not found" })
    }

    games.splice(index, 1)
    res.status(204).send()
})

app.post('/games', (req, res) => {
    const { name, price } = req.body

    if (!name || price === undefined || price === null) {
        return res.status(400).send({ error: "One or more required fields are missing" })
    }

    if (typeof name !== 'string' || typeof price !== 'number' || isNaN(price) || price < 0) {
        return res.status(400).send({ error: "Invalid game parameter values" })
    }

    const gameExists = games.some(game => game.name.toLowerCase() === name.trim().toLowerCase())
    if (gameExists) {
        return res.status(409).send({ error: "Game with the same title already exists" })
    }

    const createdGame = {
        id: nextId++,
        name: name.trim(),
        price: price
    }

    games.push(createdGame)

    res.status(201)
        .location(`${getBaseUrl(req)}/games/${createdGame.id}`)
        .send(createdGame)
})

// PUT /games/:id — обновление имеющейся игры
app.put('/games/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
        return res.status(400).send({ error: "Invalid ID format" })
    }

    const game = games.find(g => g.id === id)
    if (!game) {
        return res.status(404).send({ error: "Game not found" })
    }

    const { name, price } = req.body

    // 1. Проверка на отсутствие обязательных полей (400)
    if (!name || price === undefined || price === null) {
        return res.status(400).send({ error: "One or more required fields are missing" })
    }

    // 2. Проверка невалидных значений (400)
    if (typeof name !== 'string' || typeof price !== 'number' || isNaN(price) || price < 0) {
        return res.status(400).send({ error: "Invalid game parameter values" })
    }

    // 3. Проверка на совпадение названия с ДРУГОЙ игрой (409 Conflict)
    const gameExists = games.some(g => g.id !== id && g.name.toLowerCase() === name.trim().toLowerCase())
    if (gameExists) {
        return res.status(409).send({ error: "Game with the same title already exists" })
    }


    game.name = name.trim()
    game.price = price

    res.send(game)
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`)
})