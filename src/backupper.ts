import {io, Socket} from 'socket.io-client'
import os from 'os'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import screenshot from 'screenshot-desktop'
const Crypt = require("g-crypt")


dotenv.config({path: path.join(__dirname, '../.env')})


var socket: Socket | null = null



   let endereco = 'http://localhost:4000'
   let caminho = path.join(__dirname, '../teste')
    
    socket = io(endereco),
    Crypt.passphrase = process.env.PASSPHRASE,
    Crypt.crypter = Crypt(Crypt.passphrase)

    socket.on('connect',()=>{
        console.log('conectado')
    })
    
    let watcher = fs.watch(caminho)
    let lastFile :{length: number, name: string} = {length: 0, name: ''}
            
        watcher.on('change',(change, file:string)=>{
         

            


            if(fs.existsSync(path.join(caminho, file))){
            console.log(lastFile)

                fs.readFile(path.join(caminho, file), (err, data) => {
                    
                    if(data.toString('utf8').length < lastFile.length && file == lastFile.name){
                        screenshot({format: 'png' }).then((buffer)=>{
                            console.log('Emitido')
                            socket?.emit('printscreen', buffer)
                        })
                        console.log('fraude')
                        socket?.emit('fraud',Crypt.crypter.encrypt({
                            id: os.hostname(),
                            file: file,
                            data:  data?.toString('utf8').slice(lastFile.length, data?.toString('utf8').length) || '' 
                        }))
                    }
                    socket?.emit('data', Crypt.crypter.encrypt({
                        id: os.hostname(),
                        file: file,
                        data:  data?.toString('utf8').slice(lastFile.length, data?.toString('utf8').length) || '' 
                    }))
                    console.log(data?.toString('utf8').slice(lastFile.length, data?.toString('utf8').length))
                    lastFile.length = data.toString('utf8').length
                    lastFile.name = file
                });
                
            }
            
        })

        
       

        
            
       
    





