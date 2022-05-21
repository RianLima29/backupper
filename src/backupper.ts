import {io, Socket} from 'socket.io-client'
import os from 'os'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import screenshot from 'screenshot-desktop'
const ss = require('socket.io-stream')
const Crypt = require("g-crypt")


dotenv.config({path: path.join(__dirname, '../.env')})

var socket: Socket | null = null

let endereco = process.env.ENDERECO || ''

let currentYear = new Date().getFullYear();
let currentMonth: number | string = new Date().getMonth() + 1
let currentDay: number = new Date().getDate()
switch (currentMonth) {
    case 1:
        currentMonth = 'Janeiro'
        break;
    case 2:
        currentMonth = 'Fevereiro'
    break;
    case 3:
        currentMonth = 'Março'
        break;
    case 4:
        currentMonth = 'Abril'
        break;
    case 5:
        currentMonth = 'Maio'
        break;
    case 6:
        currentMonth = 'Junho'
        break;
    case 7:
        currentMonth = 'Julho'
        break;
    case 8:
        currentMonth = 'Agosto'
        break;
    case 9:
        currentMonth = 'Setembro'
        break;
    case 10:
        currentMonth = 'Outubro'
        break;
    case 11:
        currentMonth = 'Novembro'
        break;
    case 12:
        currentMonth = 'Dezembro'
        break;
}
let caminho = path.join(`${process.env.CAMINHO}\\${currentYear}\\${currentMonth}`)

    socket = io(endereco),
    Crypt.passphrase = process.env.PASSPHRASE,
    Crypt.crypter = Crypt(Crypt.passphrase)

    socket.on('connect',()=>{
            console.log(`Conectado em : ${process.env.ENDERECO}`)
            socket?.emit('needTodaysFile?', Crypt.crypter.encrypt({
                id: os.hostname(),
                file: `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`
            }))
                    
    })
    socket.on('sendTodaysFile', ()=>{
        console.log(`gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`)
           
                if(!fs.existsSync(path.join(caminho, `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`))){
                    console.log('O arquivo solicitado pelo servidor ainda não foi criado')
                }else{

                 let stream = ss.createStream()
                
                fs.createReadStream(path.join(caminho, `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`)).pipe(stream)
                ss(socket)?.emit('todaysFile', stream ,Crypt.crypter.encrypt({
                    id: os.hostname(),
                    file: `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`,
                }))
                stream.on('end', ()=>{
                    console.log('enviado')
                })

                socket?.on('suc',()=>{

                     fs.readFile(path.join(caminho, `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`),(err, data)=>{
                        lastFile.data = data.toString('utf8')
                        lastFile.length = data.toString('utf8').length
                        lastFile.name = `gcecho${currentDay < 10 ? 0 : ''}${currentDay}.log`
                        console.log('consegui')
                    })
                    
                })
                }
    })
    socket.on('disconnect',(err)=>{
        console.log(err)
    })
    
    if(fs.existsSync(caminho)){
        var watcher = fs.watch(caminho)
        console.log(`Diretorio encontrado! observando o diretorio: ${caminho}`)
    }else{
        var watcher = fs.watch('./')
        console.log('O caminho configurado no arquivo de variaveis do sistema esta errado, por favor revise-o')
    }
    let lastFile :{length: number, name: string, data: string } = {length: 0, name: '', data: ''}
        
        watcher.on('change',(change, file:string)=>{
            if(fs.existsSync(path.join(caminho, file))){
                fs.readFile(path.join(caminho, file), (err, data) => {

                    if(err){
                        throw err;
                    }

                    if(data.toString('utf8').length < lastFile.length  && file == lastFile.name){
                        screenshot({format: 'png' }).then((buffer)=>{
                            console.log('Printscreen emitido')
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
                    
                    lastFile.data = data.toString('utf8')
                    lastFile.length = data.toString('utf8').length
                    lastFile.name = file
                    console.log(`${lastFile.length} tamanho da ultima mensagem enviada em caracteres`)
                });
                
            }
            
        })

        
       

        
            
       
    





