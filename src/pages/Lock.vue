<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col cols="12" style="display: flex;align-items: center;justify-content: center; text-align: center">
            <div>
              <h1>Máy đang bị khóa</h1>
              <br><br><br><br><br><br>
              <div>
                <h1>Mã bảo vệ</h1>
                <v-otp-input
                    v-model:value="pin"
                    input-classes="otp-input"
                    separator="-"
                    :num-inputs="6"
                    :should-auto-focus="true"
                    input-type="password"
                    @on-complete="pinComplete"
                    @on-change="pinOnChange"
                />
                <v-btn variant="plain" @click="forgetPIN" >Quên mã PIN</v-btn>
              </div>
              <v-alert v-if="errorMsg"  v-model:text="errorMsg" type="error" variant="tonal"></v-alert>
            </div>
            
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <div style="position: fixed; bottom: 30px; right: 50px">
    <v-btn size="large" color="error" @click="shutdown">Tắt máy</v-btn>
    <v-btn size="large" color="primary" @click="showPin = true">Mở khóa</v-btn>
  </div>
</template>

<script setup lang="ts">

import VOtpInput from 'vue3-otp-input'
import {ref} from "vue";
import { useRouter } from 'vue-router'

const router = useRouter()
const showPin = ref(false)
const pin = ref('')
const errorMsg = ref('')

const pinComplete = async (value) => {
  const checkPin = await window.electron.ipcRenderer.invoke('checkPin', {
    pin: value
  })
  
  if (checkPin) {
    console.log("check pin success");
    await window.electron.ipcRenderer.invoke('unlock');
    pin.value = ''
  }
  else {
    console.log("check pin fail");
    errorMsg.value = "Mã PIN không chính xác"
    showPin.value = false
    pin.value = ''
  }
}

const pinOnChange =  async () => {
  errorMsg.value = ""
}

const shutdown = async () => {
  await window.electron.ipcRenderer.invoke('sleep')
}

const forgetPIN = async () => {
  await router.push({ name: 'change-pin' })
  // setTimeout(() => {
  //   window.electron.ipcRenderer.invoke('showChangePin')
  // }, 200)
}

</script>

<style scoped></style>
