import { Socket, io } from 'socket.io-client'
import { useEffect, useState } from 'react';

const geolocation = (socket: Socket) => {
  window.navigator.geolocation.getCurrentPosition((position) => {
    console.log('success')
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
    socket.emit("geolocation-response", { hubId: socket.id, latitude, longitude })
    console.log({ latitude, longitude })
  }, () => {
    console.log('error');
  });
}

export default function Home() {
  const [socket, setSocket] = useState<Socket>()

  useEffect(() => {
    const socket = io('ws://localhost:3000');
    socket.on("connect", () => {
      setSocket(socket)
    });
    socket.on('geolocation-request', () => {
      geolocation(socket)
    })
  }, [])

  return (
    <div>
      <div>Hub Page</div>
      <div>
        <iframe src={`http://localhost:3001/frame?id=${socket?.id}`}></iframe>
      </div>
    </div>
  )
}
