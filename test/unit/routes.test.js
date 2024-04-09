import { describe, test, expect, jest } from '@jest/globals'
import Routes from '../../src/routes'
import TestUtil from '../_util/testUtil'
import UploadHandler from '../../src/uploadHandler'

describe("Routes test suite", () => {

    const request = TestUtil.generateReadableStream(['some file bytes'])
    const response = TestUtil.generateWritableStream(() => { })
    const defaultParams = {
        request: Object.assign(request, {
            headers: {
                'Content-Type': 'multipar/form-data',
            },
            method: '',
            body: {}
        }),
        response: Object.assign(response, {
            setHeader: jest.fn(),
            writeHead: jest.fn(),
            end: jest.fn()
        }),
        values: () => Object.values(defaultParams)
    }

    describe("#setSocketInstance", () => {
        test('setSocket should store to instance', () => {
            const routes = new Routes();

            const ioObj = {
                to: (id) => ioObj,
                emit: (event, message) => { }
            }

            routes.setSocketInstance(ioObj)

            expect(routes.io).toStrictEqual(ioObj);
        })
    })

    describe("#Handler", () => {

        test("given an inexistent route it should choose default route", async () => {
            const routes = new Routes()
            const params = {
                ...defaultParams
            }

            params.request.method = 'inexistent'

            await routes.handler(...params.values())

            expect(params.response.end).toHaveBeenCalledWith("Hello, world")

        })
        test('it should set any request with CORS enabled', async () => {
            const routes = new Routes()
            const params = {
                ...defaultParams
            }

            params.request.method = 'inexistent'
            await routes.handler(...params.values())
            expect(params.response.setHeader)
                .toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
        })

        test('given method OPTIONS it should choose options route', async () => {
            const routes = new Routes()
            const params = {
                ...defaultParams
            }

            params.request.method = 'OPTIONS'
            await routes.handler(...params.values())
            expect(params.response.writeHead).toHaveBeenCalledWith(204)
            expect(params.response.end).toHaveBeenCalled()
        })

        test('given method POST it should choose post route', async () => {
            const routes = new Routes()
            const params = {
                ...defaultParams
            }

            params.request.method = 'POST'
            jest.spyOn(routes, routes.post.name).mockResolvedValue()

            await routes.handler(...params.values())
            expect(routes.post).toHaveBeenCalled()

        })

        test('given method GET it should choose get route', async () => {
            const routes = new Routes()
            const params = {
                ...defaultParams
            }
            jest.spyOn(routes, routes.get.name).mockResolvedValue()

            params.request.method = 'GET'
            await routes.handler(...params.values())
            expect(routes.get).toHaveBeenCalled()

        })

    })

    describe("#Get", () => {
        test('given method GET it should list all files downloaded', async () => {
            const routes = new Routes()
            const params = {
                ...defaultParams
            }

            const filesStatusesMock = [
                {
                    size: '200 kB',
                    lastModified: '2024-03-29T12:49:59.863Z',
                    owner: 'matheusgsantos',
                    file: 'file.png'
                }
            ]

            jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
                .mockResolvedValue(filesStatusesMock)

            params.request.method = 'GET'
            await routes.handler(...params.values())


            expect(params.response.writeHead).toHaveBeenCalledWith(200)
            expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(filesStatusesMock))

        })
    })


    describe("#POST", () => {

        it('should validate post route workflow', async () => {
            const routes = new Routes('/tmp')

            const options = {
                ...defaultParams
            }
            options.request.method = 'POST'
            options.request.url = '?socketId=10'

            jest.spyOn(
                UploadHandler.prototype,
                UploadHandler.prototype.registerEvents.name
            ).mockImplementation((headers, onFinish) => {
                const writable = TestUtil.generateWritableStream(() => { })
                writable.on("finish", onFinish)

                return writable
            })

            await routes.handler(...options.values())

            expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled()
            expect(options.response.writeHead).toHaveBeenCalledWith(200)

            const expectedResult = JSON.stringify({ result: 'Files uploaded with success! ' })
            expect(options.response.end).toHaveBeenCalledWith(expectedResult)
        })

    })
})