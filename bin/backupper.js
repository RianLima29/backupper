#! node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const socket_io_client_1 = require("socket.io-client");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
commander_1.program.version('1.0');
commander_1.program.usage('connect [endereco do servidor] [caminho do arquivo]');
var socket = null;
commander_1.program.command('connect')
    .description('Conecta ao endereco especificado')
    .argument('endereco', 'endereco do servidor')
    .argument('caminho', 'caminho do diretório a ser monitorado')
    .action((endereco, caminho) => {
    fs_1.default.watch(caminho, (change, file) => {
        console.log(file);
        fs_1.default.readFile(path_1.default.join(caminho, file), (err, data) => {
            if (err)
                throw err;
            console.log('Arquivo modificado.');
            socket === null || socket === void 0 ? void 0 : socket.emit('data', {
                id: os_1.default.hostname(),
                file: file,
                data: data.toString('utf8')
            });
        });
    });
    socket = (0, socket_io_client_1.io)(endereco);
    socket.io.on('error', () => {
        console.log('erro ao se conectar, verifique a rede');
        socket === null || socket === void 0 ? void 0 : socket.close();
        process.exit();
    });
    socket.on('connect', () => {
        console.log(`Conexão estabelecida com sucesso em ${endereco}, esperando modificacoes no diretório...`);
    });
});
commander_1.program.parse(process.argv);
