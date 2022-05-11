const fs = require('fs');

setInterval(() => {
    
    let data = ''
    if(fs.existsSync('./teste/teste.txt')){
        data = fs.readFileSync('./teste/teste.txt')
    }
    fs.writeFileSync('./teste/teste.txt', data+'TESTE TESTE TESTE TESTE TESTE TESTE TESTE \n')
  
}, 4000);