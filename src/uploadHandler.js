import Busboy from 'busboy'
import fs from 'fs';
import { pipeline } from 'stream/promises'
import { logger } from './logger';


export default class UploadHandler {
    constructor({ io, sockedId, downloadsFolder }) {
        this.io = io
        this.sockedId = sockedId
        this.downloadsFolder = downloadsFolder
    }


    handleFileBytes() {

    }

    async onFile(fieldName, file, filename) {
        const saveTo = `${this.downloadsFolder}/${filename}`
        await pipeline(
            // 1o passo, readable stream!
            file,
            // 2o passo, filtrar, converter, transformar dados!
            this.handleFileBytes.apply(this, [filename]),
            // 3o passo, writable stream!
            fs.createWriteStream(saveTo)
        )

        logger.info(`File [${filename}] finished`);
    }

    registerEvents(headers, onFinish) {
        const busboy = new Busboy({ headers })

        busboy.on("file", this.onFile.bind(this))

        busboy.on("finish", onFinish)

        return busboy

    }
}