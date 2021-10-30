import * as http from 'http'

import { Server } from "socket.io"
import axios from 'axios'
import bodyParser from 'body-parser';
import express from 'express'
import next from 'next'

const port = process.env.PORT || '3000'
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const expressServer = express()
const httpServer = new http.Server(expressServer)
const io = new Server(httpServer);

// set up socket.io and bind it to our
// http server.

const requests: {hubId: string, id: string}[] = []

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('geolocation-request', ({ hubId, id }) => {
    requests.push({ hubId, id })
    axios.post('http://localhost:3000/geolocation-request', {
      hubId,
      callbackUrl: 'http://localhost:3001/geolocation-response'
    })
  })
})

app.prepare().then(() => {

  expressServer.use(bodyParser.json());
  expressServer.use(bodyParser.raw());

  expressServer.post('/geolocation-response', (req) => {
    const { hubId, latitude, longitude } = req.body
    console.log(`geolocation-response ${hubId}, ${latitude}, ${longitude}`)
    const found = requests.find(r => r.hubId === hubId)
    if (!found) throw new Error('could not match hubid with id')
    io.to(found.id).emit('geolocation-response', { latitude, longitude })
  })

  expressServer.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
