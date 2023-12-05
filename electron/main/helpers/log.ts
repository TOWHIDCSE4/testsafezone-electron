import dayjs from "dayjs";
import pathUserData from "./path-user-data";
import * as fs from "fs"

const logBaseName = "sz"
const logFolder  = pathUserData

const writeLog = (content: any, module: string = '') => {
    try {
        if (typeof content == 'object') {
            content = JSON.stringify(content)
        }
        const logPath = `${logFolder}/${logBaseName}_${dayjs().format("YYYY-MM-DD")}.log`

        const logStr = `${(new Date).toISOString()} [${module}] ${content}`
        console.log(logStr)
        fs.appendFileSync(logPath, logStr + "\r\n");
    } catch (error) {
        console.error(error)
    }
}

export {
    writeLog
}