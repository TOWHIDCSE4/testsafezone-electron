<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <h1>Mã bảo vệ</h1>
            <v-otp-input
              v-model:value="pin"
              input-classes="otp-input"
              separator="-"
              :num-inputs="6"
              :should-auto-focus="true"
              input-type="password"
              @on-complete="pinComplete"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <div style="position: fixed; bottom: 20px; right: 20px">
    <v-btn color="error" @click="close">Hủy</v-btn>
  </div>
</template>

<script setup lang="ts">
import VOtpInput from 'vue3-otp-input'
import { ref } from 'vue'

const pin = ref('')

const pinComplete = async (value) => {
  if (!await window.electron.ipcRenderer.invoke('checkPin', {
    pin: value
  })) {
    pin.value = ''
  }
  pin.value = ''
}

const close = async () => {
  await window.electron.ipcRenderer.invoke('hidePin')
  pin.value = ''
}
</script>

<style>
body {
  padding: 0 !important;
}
h1 {
  margin-bottom: 20px !important;
}
</style>
