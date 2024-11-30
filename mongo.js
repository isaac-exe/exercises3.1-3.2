const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const pw = process.argv[2]

const name = process.argv[3]

const phonenumber = process.argv[4]

const url = `mongodb+srv://iscrnldo:${pw}@cluster0.cj9ky.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Entry = mongoose.model('Entry', phonebookSchema)

if (process.argv.length === 3)  {
    Entry.find({}).then(result => {
        result.forEach(entry => {
            console.log(entry)
        })
        mongoose.connection.close()
    })
} else {
    const entry = new Entry({
        name: name,
        number: phonenumber
    })

    entry.save().then(() => {
        console.log('note saved!')
        mongoose.connection.close()
    })
}

