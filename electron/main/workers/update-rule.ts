import { TIME_UPDATE_RESTRICT_TIME, TIME_UPDATE_RULE_WEB, TIME_UPDATE_ZVELO_KEY } from '../const/interval-const'
import {
  updateActivityControlRule,
  updateDailyTimeRule,
  updateRestrictedTimeRule,
  updateWebRule,
  updateZvelo
} from '../helpers/rules'

//Update web filter rule mỗi 10p
setInterval(async () => {
  try {
    await updateWebRule()
  } catch (e) {}
}, TIME_UPDATE_RULE_WEB)

//Update restricted times mỗi 5p
setInterval(async () => {
  try {
    await updateRestrictedTimeRule()
  } catch (e) {}
}, TIME_UPDATE_RESTRICT_TIME - 10000)

//Update daily time limit mỗi 5p
setInterval(async () => {
  try {
    await updateDailyTimeRule()
  } catch (e) {}
}, TIME_UPDATE_RESTRICT_TIME - 20000)

//Update activity-control mỗi 10p
setInterval(async () => {
  try {
    await updateActivityControlRule()
  } catch (e) {}
}, TIME_UPDATE_RULE_WEB + 10000)

//Update Zvelo key mỗi 2h
setInterval(async () => {
  try {
    await updateZvelo()
  } catch (e) {}
}, TIME_UPDATE_ZVELO_KEY)
