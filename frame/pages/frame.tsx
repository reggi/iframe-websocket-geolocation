import {Socket, io} from 'socket.io-client';
import {useEffect, useState} from 'react';

import { useRouter } from "next/dist/client/router"

export default function Frame() {
    const [socket, setSocket] = useState<Socket>()
    const [{latitude, longitude}, setLatLong] = useState<{ latitude: number, longitude: number }>({ latitude: 0, longitude: 0})
    const router = useRouter()
    const {id: hubId} = router.query

    useEffect(() => {
        const socket = io('ws://localhost:3001');
        socket.on("connect", () => {
          setSocket(socket)
        });
        socket.on('geolocation-response', message => {
            setLatLong(message)
        })
      }, [])

    return (
        <div>
            <div>Widget Frame: {hubId}</div>
            <div>
                { latitude !== 0 && longitude !== 0 ? (
                    <div>{latitude} {longitude}</div>
                ) : (
                    <button onClick={() => {
                        socket?.emit('geolocation-request', { hubId, id: socket.id })
                    }}>GEOLOCATE</button>
                )}
            </div>
        </div>
    )
  
}
  