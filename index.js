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
app.delete('/games/:id', (req, res) => {
    // 1. Проверяем, существует ли игра по индексу (id - 1)
    if (typeof games[req.params.id - 1] === 'undefined') {
        return res.status(404).send({ error: "Game not found" })
    }

    // 2. Удаляем элемент из массива
    games.splice(req.params.id - 1, 1)

    // 3. Возвращаем 204 No Content
    res.status(204).send()
})
// POST /games с валидацией и полным URL в заголовке Location
app.post('/games', (req, res) => {
    const { name, price } = req.body

    // 1. Проверка на отсутствие обязательных параметров (400)
    if (!name || price === undefined || price === null) {
        return res.status(400).send({ error: "One or more required fields are missing" })
    }

    // 2. Проверка на невалидные значения параметров (400)
    // (например, если имя не строка, цена не число или отрицательная)
    if (typeof name !== 'string' || typeof price !== 'number' || isNaN(price) || price < 0) {
        return res.status(400).send({ error: "Invalid game parameter values" })
    }

    // 3. Проверка на существование игры с таким же названием (409 Conflict)
    const gameExists = games.some(game => game.name.toLowerCase() === name.trim().toLowerCase())
    if (gameExists) {
        return res.status(409).send({ error: "Game with the same title already exists" })
    }

    // 4. Успешное создание (201 Created)
    const createdGame = {
        id: games.length + 1,
        name: name.trim(),
        price: price
    }

    games.push(createdGame)

    res.status(201)
        .location(`${getBaseUrl(req)}/games/${createdGame.id}`)
        .send(createdGame)
})
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`)
})