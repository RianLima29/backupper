#! node

import {program} from 'commander'
import {io, Socket} from 'socket.io-client'
import os from 'os'
import fs from 'fs'
import path from 'path'
const Crypt = require("g-crypt")

program.version('2.0')
program.usage('connect [endereco do servidor] [caminho do arquivo]')

var socket: Socket | null = null



program.command('connect')
    
    .description('Conecta ao endereco especificado')
    .argument('endereco', 'endereco do servidor')
    .argument('caminho', 'caminho do diretório a ser monitorado')
    .action((endereco, caminho)=>{

    let watcher = fs.watch(caminho)

       
            
        watcher.on('change',(change, file:string)=>{
                
            if(fs.existsSync(path.join(caminho, file))){
                
                fs.readFile(path.join(caminho, file), (err, data) => {
                    console.log(fs.existsSync(path.join(caminho, file)), path.join(caminho, file))
                    console.log('Arquivo modificado.');
                    socket?.emit('data', Crypt.crypter.encrypt({
                        id: os.hostname(),
                        file: file,
                        data:  data?.toString('utf8') || '' 
                    }))
                });
                
            }
            
        })

        socket = io(endereco),
            Crypt.passphrase = 'fcf8afd67e96fa3366dd8eafec8bcace',
            Crypt.crypter = Crypt(Crypt.passphrase)
            
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

