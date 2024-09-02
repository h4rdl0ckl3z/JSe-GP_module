# JSe-GP_module (Thai e-Government Procurement)
## NodeJS ≥ 18
```
npm install
```
### example
```
e_GP(['egpid']).then(function (data) {
    console.log(JSON.parse(data));
});
```
or
```
const { e_GP } = require('./e_GP');

e_GP(['egpid']).then(function (data) {
    console.log(JSON.parse(data));
});
```
### json to csv
```
const { e_GP } = require('./e_GP');

e_GP(['egpid']).then(function (data) {
    let converter = require('json-2-csv');
    const csv = converter.json2csv(JSON.parse(data));
    const fs = require('node:fs');
    fs.writeFile('output.csv', csv, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });
});
```

![image](https://github.com/user-attachments/assets/cd9987d5-ada6-4e88-a375-a6e8cd147b33)


###### Python
###### https://github.com/h4rdl0ckl3z/PYe-GP_module
