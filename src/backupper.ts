#! node

import {program} from 'commander'
import {io, Socket} from 'socket.io-client'
import os from 'os'
import fs from 'fs'
import path from 'path'

program.version('1.0')
program.usage('connect [endereco do servidor] [caminho do arquivo]')

var socket: Socket | null = null

program.command('connect')
    
    .description('Conecta ao endereco especificado')
    .argument('endereco', 'endereco do servidor')
    .argument('caminho', 'caminho do diretório a ser monitorado')
    .action((endereco, caminho)=>{

        fs.watch(caminho, (change:fs.WatchEventType, file:string)=>{
            console.log(file)
            fs.readFile(path.join(caminho, file), (err, data) => {
                if (err) throw err;
                console.log('Arquivo modificado.');
                socket?.emit('data', {
                    id: os.hostname(),
                    file: file,
                    data: data.toString('utf8')
                })
            });
        })

        socket = io(endereco)
        socket.io.on('error', ()=>{
            console.log('erro ao se conectar, verifique a rede')
            socket?.close()
            process.exit();
        })
        socket.on('connect', ()=>{
            console.log(`Conexão estabelecida com sucesso em ${endereco}, esperando modificacoes no diretório...`)
        })
    })


program.parse(process.argv)

