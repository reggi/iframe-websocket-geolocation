import * as http from 'http'

import { Server } from "socket.io"
import axios from 'axios'
import bodyParser from 'body-parser'
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

const requestStore: { hubId: string, callbackUrl: string }[] = []

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('geolocation-response', ({ hubId, latitude, longitude }) => {
    const found = requestStore.find(storedRequest => storedRequest.hubId == hubId)
    if (!found) throw new Error('unable to find requestor')
    axios.post(found.callbackUrl, { hubId, latitude, longitude })
  })
})

app.prepare().then(() => {
  
  expressServer.use(bodyParser.json());
  expressServer.use(bodyParser.raw());

  expressServer.post('/geolocation-request', (req) => {
      const { hubId, callbackUrl } = req.body
      requestStore.push({ hubId, callbackUrl })
      console.log(`geolocation-request ${hubId} from ${callbackUrl}`)
      io.to(hubId).emit('geolocation-request')
  })

  expressServer.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
