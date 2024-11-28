const cors = require('cors');
const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(cors())

morgan.token('body', getPostData = (request) => {
    return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

app.use(morgan(':method :url :status :req[Content-Length] :res[Content-Length] :total-time ms :body'))

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.statusMessage = `person with id ${id} not found`
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    const text = `Phonebook has info for ${persons.length} people`
    const time = Date()
    response.send(`<p>${text}</p> <p>${time}</p>`)
})

const generateID = () => {
    const idNum = Math.floor(Math.random() * 1000) + 1
    return idNum.toString()
}

const inPhonebook = name => persons.map(person => person.name).includes(name)

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name && !body.number) {
        return response.status(400).json({
            error: 'Name & number are missing.'
        })
    } else if (!body.name) {
        return response.status(400).json({
            error: 'Name is missing.'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'Number is missing.'
        })
    } else if (inPhonebook(body.name)) {
        return response.status(400).json({
            error: `${body.name} already exists.`
        })
    }

    const person = {
        id: generateID(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})

// app.put('/api/persons/:id', (request, response) => {})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    console.log(id)
    response.json({id: id})
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})