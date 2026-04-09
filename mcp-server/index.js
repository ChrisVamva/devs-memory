#!/usr/bin/env node
const { Server }   = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js')
const fs   = require('fs')
const path = require('path')
const os   = require('os')

// ── Resolve data file (same path Electron uses) ──
function getDataFile() {
  const override = process.env.DEVS_MEMORY_DATA
  if (override) return override
  const platform = process.platform
  let base
  if (platform === 'win32')  base = process.env.APPDATA || os.homedir()
  else if (platform === 'darwin') base = path.join(os.homedir(), 'Library', 'Application Support')
  else base = path.join(os.homedir(), '.config')
  return path.join(base, 'devs-memory', 'data.json')
}

const DATA_FILE = getDataFile()

function read() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) } catch { return [] }
}

function write(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function uid() { return Math.random().toString(36).slice(2, 9) }

// ── Server ──
const server = new Server(
  { name: 'devs-memory', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_categories',
      description: "List all categories in Dev's Memory",
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'add_category',
      description: "Add a new category to Dev's Memory",
      inputSchema: {
        type: 'object',
        properties: { name: { type: 'string', description: 'Category name' } },
        required: ['name']
      }
    },
    {
      name: 'add_command',
      description: "Add a command to a category in Dev's Memory",
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Category name (case-insensitive)' },
          label:    { type: 'string', description: 'Short label for the command' },
          value:    { type: 'string', description: 'The actual command string' }
        },
        required: ['category', 'label', 'value']
      }
    },
    {
      name: 'list_commands',
      description: "List all commands in a category",
      inputSchema: {
        type: 'object',
        properties: { category: { type: 'string' } },
        required: ['category']
      }
    },
    {
      name: 'delete_command',
      description: "Delete a command from a category by label",
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          label:    { type: 'string' }
        },
        required: ['category', 'label']
      }
    },
    {
      name: 'delete_category',
      description: "Delete an entire category",
      inputSchema: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name']
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params
  const data = read()

  function findCat(n) {
    return data.find(c => c.name.toLowerCase() === n.toLowerCase())
  }

  function text(str) {
    return { content: [{ type: 'text', text: str }] }
  }

  if (name === 'list_categories') {
    if (!data.length) return text('No categories yet.')
    return text(data.map(c => `• ${c.name} (${c.commands.length} commands)`).join('\n'))
  }

  if (name === 'add_category') {
    if (findCat(args.name)) return text(`Category "${args.name}" already exists.`)
    data.push({ id: uid(), name: args.name, commands: [], style: {}, note: '' })
    write(data)
    return text(`Category "${args.name}" created.`)
  }

  if (name === 'add_command') {
    let cat = findCat(args.category)
    if (!cat) {
      // auto-create category if it doesn't exist
      cat = { id: uid(), name: args.category, commands: [], style: {}, note: '' }
      data.push(cat)
    }
    const exists = cat.commands.find(c => c.label.toLowerCase() === args.label.toLowerCase())
    if (exists) {
      exists.value = args.value
      write(data)
      return text(`Updated "${args.label}" in ${cat.name}.`)
    }
    cat.commands.push({ id: uid(), label: args.label, value: args.value })
    write(data)
    return text(`Added "${args.label}" to ${cat.name}.`)
  }

  if (name === 'list_commands') {
    const cat = findCat(args.category)
    if (!cat) return text(`Category "${args.category}" not found.`)
    if (!cat.commands.length) return text(`No commands in ${cat.name}.`)
    return text(cat.commands.map(c => `• ${c.label}: ${c.value}`).join('\n'))
  }

  if (name === 'delete_command') {
    const cat = findCat(args.category)
    if (!cat) return text(`Category "${args.category}" not found.`)
    const before = cat.commands.length
    cat.commands = cat.commands.filter(c => c.label.toLowerCase() !== args.label.toLowerCase())
    if (cat.commands.length === before) return text(`Command "${args.label}" not found.`)
    write(data)
    return text(`Deleted "${args.label}" from ${cat.name}.`)
  }

  if (name === 'delete_category') {
    const idx = data.findIndex(c => c.name.toLowerCase() === args.name.toLowerCase())
    if (idx === -1) return text(`Category "${args.name}" not found.`)
    data.splice(idx, 1)
    write(data)
    return text(`Deleted category "${args.name}".`)
  }

  return text(`Unknown tool: ${name}`)
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`Dev's Memory MCP server running — data: ${DATA_FILE}`)
}

main().catch(console.error)
