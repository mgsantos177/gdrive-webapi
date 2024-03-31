import { describe, test, expect, jest } from '@jest/globals'
import fs from 'fs'
import Routes from '../../src/routes'
import UploadHandler from '../../src/uploadHandler'
import TestUtil from '../_util/testUtil'
import { resolve } from 'path'

describe("#UploadHandler test suite", () => {

    const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => { }
    }

    describe("#registerEvents", () => {
        test("Should call onFile and onFinish function on Busboy instance", () => {
            const uploadHandler = new UploadHandler({
                io: ioObj,
                sockedId: '01'
            })

            jest.spyOn(uploadHandler, uploadHandler.onFile.name)
                .mockResolvedValue()

            const headers = {
                'content-type': 'multipart/form-data; boundary='
            }

            const onFinish = jest.fn()
            const busboyInstance = uploadHandler.registerEvents(headers, onFinish)

            const fileStream = TestUtil.generateReadableStream(['example', 'of', 'chunk'])
            busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt')
            busboyInstance.listeners("finish")[0].call()

            expect(uploadHandler.onFile).toHaveBeenCalled()
            expect(onFinish).toHaveBeenCalled()
        })
    })


    describe("#onFile", () => {
        test('given a stream file it should save it on disk', async () => {
            const chunks = ['hey', 'Jude']
            const downloadsFolder = '/tmp'

            const handler = new UploadHandler({
                io: ioObj,
                socketId: '01',
                downloadsFolder
            })


            const onData = jest.fn()
            jest.spyOn(fs, fs.createWriteStream.name)
                .mockImplementation(() => TestUtil.generateWritableStream(onData))

            const onTransform = jest.fn()
            jest.spyOn(handler, handler.handleFileBytes.name)
                .mockImplementation(() => TestUtil.generateTransformStream(onTransform))

            const params = {
                fieldname: 'video',
                file: TestUtil.generateReadableStream(chunks),
                filename: 'mockFile.mov'
            }

            await handler.onFile(...Object.values(params))

            expect(onData.mock.calls.join()).toEqual(chunks.join())
            expect(onTransform.mock.calls.join()).toEqual(chunks.join())

            // const expectedFilename = resolve(handler.downloadsFolder, params.filename)
            // expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilename)
        })
    })
})