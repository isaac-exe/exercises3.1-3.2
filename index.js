require('dotenv').config()
const Entry = require('./models/Entry');
const cors = require('cors');
const express = require('express')
const morgan = require('morgan')
const body = require("express/lib/view");
const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

morgan.token('body', getPostData = (request) => {
    return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

app.use(morgan(':method :url :status :req[Content-Length] :res[Content-Length] :total-time ms :body'))

app.get('/api/persons', (request, response) => {
    Entry.find({}).then(entries => {
        response.json(entries)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Entry.findById(request.params.id).then(entry => {
        if (entry) {
            response.json(entry)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Entry.countDocuments({}).then(count => {
        const text = `Phonebook has info for ${count} people`
        const time = Date()
        response.send(`<p>${text}</p> <p>${time}</p>`)
    }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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
    }

    const entry = new Entry({
        name: body.name,
        number: body.number,
    })

    entry.save()
        .then(savedEntry =>{
            response.json(savedEntry)
        }).catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Entry.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedEntry => {
            response.json(updatedEntry)
        })
        .catch(error => {
            console.log('hello')
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Entry.findByIdAndDelete(request.params.id)
        .then(result => {
            response.set('id', request.params.id)
            response.status(204).end()
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    } else {
        return response.status(400).send({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`))