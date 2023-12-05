import {ActivityRepository} from "../helpers/repositories";
import {IsNull, MoreThanOrEqual, Not} from "typeorm";
import {apiPost, apiPut} from "../helpers/api";
import Setting from "../helpers/setting";
import {TIME_UPLOAD_ACTIVITY } from "../const/interval-const";

let isPause = false

process.on('message', function (message: any) {
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
      const now = Date.now()
      const upActivities = await ActivityRepository.findBy({
        _id: Not(IsNull()),
        lastUpdated: MoreThanOrEqual(now - TIME_UPLOAD_ACTIVITY - 10000),
        activityType: 'APP'
      })
      const newActivities = await ActivityRepository.findBy({
        _id: IsNull()
      })
      if (upActivities) {
        await apiPut(`users/${await Setting.get('USER_ID')}/children/${await Setting.get('CHILD_ID')}/activities/batch`, upActivities.map(item=> {
          return {
            id: item._id,
            // @ts-ignore
            duration: Math.round(item.duration/1000),
          }
        }))
      }
      if (newActivities) {
        const deviceId = await Setting.get('DEVICES_ID')
        const res = await apiPost(`users/${await Setting.get('USER_ID')}/children/${await Setting.get('CHILD_ID')}/activities/batch`, newActivities.map(item=> {
          return {
            deviceId: deviceId,
            activityName: item.activityName,
            activityType: item.activityType,
            activityDisplayName: item.activityDisplayName,
            // @ts-ignore
            activityTimeStart: (new Date(item.activityTimeStart)).toISOString(),
            questionable: item.questionable,
            // @ts-ignore
            duration: Math.round(item.duration/1000),
          }
        }))

        if (res && res.success) {

          for (let index = 0; index < res.activities.length; index++) {
            await ActivityRepository.update({
              activityName: res.activities[index].identifiedActivity.activityName,
              activityTimeStart: (new Date(res.activities[index].activityTimeStart)).getTime(),
              _id: IsNull()
            }, {
              _id: res.activities[index].id
            })
          }

        }
      }
    }
  } catch (e) {}
}, TIME_UPLOAD_ACTIVITY)
