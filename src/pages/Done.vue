<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <h1>Hoàn thành</h1>
            <p>Cài đặt thành công !</p>
          </v-col>
          <v-col cols="6">
            <v-alert
              color="warning"
              icon="$warning"
              title="Đặt mã bảo mật"
              text="Mã bảo mật sẽ được sử dụng lại nhiều lần khi bố/mẹ cần mở khóa, tạm dừng, hoặc tắt SafeZone. Hãy lưu lại vào nơi an toàn!!"
            ></v-alert>
            <v-otp-input
              v-model:value="pin"
              input-classes="otp-input"
              separator="-"
              :num-inputs="6"
              :should-auto-focus="true"
              @on-change="pinChange"
              @on-complete="pinComplete"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <div style="position: fixed; bottom: 30px; right: 50px">
    <v-btn size="large" color="primary" @click="done" :disabled="!canDone"> Hoàn thành </v-btn>
  </div>
</template>

<script setup lang="ts">
import VOtpInput from 'vue3-otp-input'
import { ref } from 'vue'
const canDone = ref(false)
const pin = ref('')
const done = async () => {
  await window.electron.ipcRenderer.invoke('done', {
    pin: pin.value
  })
}
const pinChange = (value) => {
  if (value.length < 6) {
    canDone.value = false
  }
}
const pinComplete = () => {
  canDone.value = true
}
</script>

<style>
.otp-input {
  height: 50px;
  width: 40px;
  border: 1px solid #969696 !important;
  border-radius: 4px;
  margin: 30px 5px;
  font-size: 30px;
  text-align: center;
}
</style>
