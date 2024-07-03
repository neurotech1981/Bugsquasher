import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import User from './models/user.js' // Ensure the path is correct
import Data from './models/issue.js' // Ensure the path is correct

const MONGO_URI = 'mongodb://bakt:946Dypew!@localhost:27017/yt-tutorial' // Change to your MongoDB URI

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const generateUsers = async (numUsers) => {
    const users = []

    for (let i = 0; i < numUsers; i++) {
        const user = new User({
            name: faker.person.fullName(),
            email: faker.internet.email({ provider: 'example.fakerjs.dev' }),
            hashedPassword: faker.internet.password(),
            role: faker.helpers.arrayElement(['Bruker', 'Admin']),
            rights: faker.helpers.arrayElement(['Les', 'Skriv']),
            profileImage: faker.image.avatar(),
        })
        users.push(user)
    }

    return User.insertMany(users)
}

const generateIssues = async (numIssues, userIds) => {
    const issues = []

    for (let i = 0; i < numIssues; i++) {
        const issue = new Data({
            name: faker.lorem.words(),
            delegated: faker.helpers.arrayElement(userIds),
            status: faker.helpers.arrayElement(['Åpen', 'Lukket']),
            author: faker.helpers.arrayElement(userIds),
            description: faker.lorem.sentences(),
            category: faker.commerce.department(),
            environment: faker.system.commonFileType(),
            browser: faker.internet.userAgent(),
            reproduce: faker.lorem.sentences(),
            severity: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
            priority: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
            reporter: faker.helpers.arrayElement(userIds),
            project: new mongoose.Types.ObjectId(), // Assuming random project IDs
            step_reproduce: faker.lorem.sentences(),
            summary: faker.lorem.sentence(),
            assigned: faker.helpers.arrayElement(userIds),
            comments: [], // Assuming no comments for simplicity
            userid: faker.helpers.arrayElement(userIds),
            imageName: [{ type: Object, default: 'none' }],
        })
        issues.push(issue)
    }

    return Data.insertMany(issues)
}

const main = async () => {
    const numUsers = 1000
    const numIssues = 10000

    console.log('Generating users...')
    const users = await generateUsers(numUsers)
    console.log(`${numUsers} users generated.`)

    const userIds = users.map((user) => user._id)

    console.log('Generating issues...')
    await generateIssues(numIssues, userIds)
    console.log(`${numIssues} issues generated.`)

    mongoose.connection.close()
}

main().catch((err) => {
    console.error(err)
    mongoose.connection.close()
})
