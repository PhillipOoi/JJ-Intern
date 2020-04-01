'use strict'
require('env2')('.env')
const Hapi = require('@hapi/hapi')
const Path = require('path')

const init = async () => {

    const server = Hapi.server({
        port: 8080,
        host: 'localhost'
    })

    await server.register(require('hapi-auth-jwt2'))

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.JWT_SECRET,
        validate: require('./util/jwtValidate')
    })

    server.auth.default('jwt')

    await server.register([{
        plugin: require('hapi-pgsql'),
        options: {
            database_url: process.env.DATABASE_URL
        }
    }, {
        plugin: require('hapi-auto-route'),
        options: {
            routes_dir: Path.join(__dirname, 'routes')
        }
    }])

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()