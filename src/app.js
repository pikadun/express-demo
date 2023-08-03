const fs = require('node:fs/promises')
const path = require('node:path')
const express = require('express')
const BodyParser = require('body-parser')


const app = express()
const port = 3000
const dir = path.resolve(__dirname, '..', 'files')

const readFiles = async (dir, fileList = []) => {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const newPath = path.resolve(dir, file)
        const stat = await fs.stat(newPath);
        if (stat.isFile()) {
            fileList.push(newPath)
        } else {
            await readFiles(newPath, fileList)
        }
    }
}

app.use(BodyParser.json())

// 获取文件列表 GET http://localhost:3000/files
app.get('/files', async (req, res) => {
    const result = []
    await readFiles(dir, result)
    res.type('application/json')
    res.send(result);
})

// 获取文件内容 GET http://localhost:3000/file?filepath=/root/express-demo/files/1.json
app.get('/file', async (req, res) => {
    const filepath = req.query.filepath
    const content = await fs.readFile(filepath, { encoding: 'utf8' })
    res.type('application/json')
    res.send(content)
})

// 更新文件内容 POST http://localhost:3000/file?filepath=/root/express-demo/files/1.json
app.post('/file', async (req, res) => {
    const filepath = req.query.filepath
    const body = req.body;
    await fs.writeFile(filepath, JSON.stringify(body, null, 4))
    res.type('application/json')
    res.send(body)
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})
