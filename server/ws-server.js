#!/usr/bin/env node
/**
 * KAIROS 协作 WebSocket 服务
 * 基于 y-websocket，为 Konva 画布提供摊位位置实时同步
 */

const { setupWSConnection, setPersistence } = require('y-websocket/bin/utils')
const http = require('http')
const WebSocket = require('ws')

const port = process.env.WS_PORT || 3030
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'kairos-ws', version: '1.0' }))
})

const wss = new WebSocket.Server({ server })

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req, { gc: true })
})

server.listen(port, () => {
  console.log(`🌬 KAIROS 协作服务运行在 ws://localhost:${port}`)
})
