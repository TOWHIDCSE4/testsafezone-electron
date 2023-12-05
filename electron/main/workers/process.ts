import { ActivityRepository } from '../helpers/repositories'
import Setting from '../helpers/setting'
import { getProcesses } from '../helpers/processes'
import { TIME_GET_LOCAL_PROCESS_ACTIVITY } from '../const/interval-const'

let isPause = false

process.on('message', function (message) {
  try {
    if (message == 'pause') {
      isPause = true
    } else if (message == 'resume') {
      isPause = false
    }
  } catch (e) {}
})

setInterval(async () => {
  try {
    if (!isPause) {
      const blocks = await Setting.get('ACTIVITY_CONTROL', [])
      const processes = getProcesses()
      const now = Date.now()
      // process.send!(processes)

      processes.forEach((proc) => {
        let questionable = false
        if (
          blocks.find((item) => {
            return item.name === proc.name
          })
        ) {
          // if (proc.name === 'GitHubDesktop') {
          questionable = true
          process.send!({
            kill: proc.id
          })
        }
        const startTime = new Date(proc.startTime).getTime()
        ActivityRepository.upsert(
          {
            activityName: proc.name,
            activityDisplayName: proc.title,
            activityType: 'APP',
            activityTimeStart: startTime,
            duration: now - startTime,
            activityMetadata: JSON.stringify({
              path: proc.path
            }),
            questionable: questionable,
            localKey: `${proc.name}_${startTime}`,
            lastUpdated: now
          },
          {
            conflictPaths: ['localKey'],
            skipUpdateIfNoValuesChanged: true
          }
        )
      })
    }
  } catch (e) {}
}, TIME_GET_LOCAL_PROCESS_ACTIVITY)
