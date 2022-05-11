"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const Crypt = require("g-crypt");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
var socket = null;
let endereco = 'http://localhost:4000';
let caminho = path_1.default.join(__dirname, '../teste');
socket = (0, socket_io_client_1.io)(endereco),
    Crypt.passphrase = process.env.PASSPHRASE,
    Crypt.crypter = Crypt(Crypt.passphrase);
socket.on('connect', () => {
    console.log('conectado');
});
let watcher = fs_1.default.watch(caminho);
let lastFile = { length: 0, name: '' };
watcher.on('change', (change, file) => {
    if (fs_1.default.existsSync(path_1.default.join(caminho, file))) {
        console.log(lastFile);
        fs_1.default.readFile(path_1.default.join(caminho, file), (err, data) => {
            if (data.toString('utf8').length < lastFile.length && file == lastFile.name) {
                (0, screenshot_desktop_1.default)({ format: 'png' }).then((buffer) => {
                    console.log('Emitido');
                    socket === null || socket === void 0 ? void 0 : socket.emit('printscreen', buffer);
                });
                console.log('fraude');
                socket === null || socket === void 0 ? void 0 : socket.emit('fraud', Crypt.crypter.encrypt({
                    id: os_1.default.hostname(),
                    file: file,
                    data: (data === null || data === void 0 ? void 0 : data.toString('utf8').slice(lastFile.length, data === null || data === void 0 ? void 0 : data.toString('utf8').length)) || ''
                }));
            }
            socket === null || socket === void 0 ? void 0 : socket.emit('data', Crypt.crypter.encrypt({
                id: os_1.default.hostname(),
                file: file,
                data: (data === null || data === void 0 ? void 0 : data.toString('utf8').slice(lastFile.length, data === null || data === void 0 ? void 0 : data.toString('utf8').length)) || ''
            }));
            console.log(data === null || data === void 0 ? void 0 : data.toString('utf8').slice(lastFile.length, data === null || data === void 0 ? void 0 : data.toString('utf8').length));
            lastFile.length = data.toString('utf8').length;
            lastFile.name = file;
        });
    }
});
