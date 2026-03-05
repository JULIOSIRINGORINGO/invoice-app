module.exports = {
    apps: [
        {
            name: 'invoice-backend',
            cwd: './server',
            script: 'index.js',
            watch: false,
            env: {
                PORT: 3001,
                NODE_ENV: 'production'
            }
        },
        {
            name: 'invoice-frontend',
            cwd: './client',
            script: 'cmd.exe',
            args: '/c npx serve -s dist -p 5173',
            watch: false
        }
    ]
}
