const { spawn } = require('child_process')
const waitOn = require('wait-on')

const vite = spawn('npx', ['vite'], {
  shell: true,
  stdio: 'inherit',
  env: { ...process.env }
})

waitOn({ resources: ['http://localhost:5173'], timeout: 30000 }).then(() => {
  const electron = spawn('npx', ['electron', '.'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  })

  electron.on('close', () => {
    vite.kill()
    process.exit()
  })
}).catch(err => {
  console.error('Vite did not start in time:', err)
  vite.kill()
  process.exit(1)
})

process.on('SIGINT', () => {
  vite.kill()
  process.exit()
})
