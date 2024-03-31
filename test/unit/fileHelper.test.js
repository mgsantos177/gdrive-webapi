import { describe, test, expect, jest } from '@jest/globals'
import fs from "fs";
import Routes from '../../src/routes'
import FileHelper from '../../src/fileHelper';

describe("File Helper Suite", () => {
    describe("#getFileStatus", () => {
        test('it should return files statuses in correct format', async () => {

            const statMock = {
                dev: 3829393106,
                mode: 33206,
                nlink: 1,
                uid: 0,
                gid: 0,
                rdev: 0,
                blksize: 4096,
                ino: 8444249301428768,
                size: 199811,
                blocks: 392,
                atimeMs: 1711716775136.317,
                mtimeMs: 1710287492327.974,
                ctimeMs: 1711559282403.1543,
                birthtimeMs: 1711716599862.7834,
                atime: '2024-03-29T12:52:55.136Z',
                mtime: '2024-03-12T23:51:32.328Z',
                ctime: '2024-03-27T17:08:02.403Z',
                birthtime: '2024-03-29T12:49:59.863Z'
            }

            const mockUser = 'matheus.gsantos';
            process.env.USER = mockUser;
            const filename = 'file.png';

            jest.spyOn(fs.promises, fs.promises.readdir.name)
                .mockResolvedValue([filename])

            jest.spyOn(fs.promises, fs.promises.stat.name)
                .mockResolvedValue(statMock)

            const result = await FileHelper.getFilesStatus("/tmp")

            const expectedResult = [
                {
                    size: "200 kB",
                    lastModified: statMock.birthtime,
                    owner: mockUser,
                    file: filename
                }
            ]

            expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`)
            expect(result).toMatchObject(expectedResult)

        })
    })
})