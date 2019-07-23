import * as fs from 'fs';

export function  readFileSync(filename: string) {
    if (!fs.existsSync(filename)) {
        throw new Error("File does no exist");
    }
    return fs.readFileSync(filename, 'utf8');
};

export function readFile(filename: string) {
    return new Promise<string>((resolve, reject) => {
        fs.exists(filename, exists => {
            if (!exists) reject(new Error("File does not exist."))

            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) reject(new Error("Could not read file."));

                resolve(data);
            })
        })
    })
}

export function writeFileSync(filename: string, data: string) {
    fs.writeFileSync(filename, data);

};

export function writeFile(filename: string, data: string) {
    return new Promise<boolean>((resolve, reject) => {
        fs.writeFile(filename, data, error => {
            error ? reject(error) : resolve(true);
        })
    })
}

