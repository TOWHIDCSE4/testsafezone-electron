<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col  style="padding-top: 20px">
            <h1>Thay đổi mã PIN mới</h1>
            <label>Mã PIN mới</label>
            <v-otp-input
              v-model:value="pin"
              input-classes="otp-input"
              separator="-"
              :num-inputs="6"
              :should-auto-focus="true"
              input-type="password"
              :rules="[rules.required]"
            />
            <label>Nhập lại mã PIN mới</label>
            <v-otp-input
              v-model:value="pinCheck"
              input-classes="otp-input"
              separator="-"
              :num-inputs="6"
              :should-auto-focus="false"
              input-type="password"
            />
            
            <v-snackbar
              v-model="showSnackbar"
              color="red"
              :timeout="5000"
            >
              {{ errorMsg }}
              <template v-slot:actions>
                <v-btn
                  color="white"
                  variant="text"
                  @click="showSnackbar = false"
                >
                  X
                </v-btn>
              </template>
            </v-snackbar>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <div style="position: fixed; bottom: 30px; right: 50px">
    <v-btn size="large" id="btn_submit" color="primary" @click="changePin" :disabled="!canNext">Thay Đổi</v-btn>
    <v-btn size="large" id="btn_cancel" variant="outlined" color="primary" @click="close" :disabled="!canNext">Đóng</v-btn>
  </div>
</template>



<script setup lang="ts">
import VOtpInput from 'vue3-otp-input'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const rules =  {
        required: value => !!value || 'Không được để trống',
  }

// const $loading = useLoading()

const router = useRouter()

const pin = ref('')
const pinCheck = ref('')
const canNext = ref(true)
// const show = ref(false)
const showSnackbar = ref(false)
const errorMsg = ref("")

const changePin = async () => {
  
  if (pin.value.length != 6) {
    errorMsg.value = "Mã PIN phải có 6 ký tự"
    showSnackbar.value = true
    return
  }
  if (pin.value !== pinCheck.value) {
    errorMsg.value = "Mã PIN xác nhận không trùng khớp"
    showSnackbar.value = true
    return
  }
  await window.electron.ipcRenderer.invoke('saveNewPin', {
    pin: pin.value
  })
  router.go(-2) // back to lock screen
  window.electron.ipcRenderer.invoke('closeChangePin')
  //
}

const close = async () => {
  await window.electron.ipcRenderer.invoke('closeChangePin')
  router.go(-2) // back to lock screen
}

</script>

<style scoped>
.form-field {
  margin-top: 10px;
}
</style>
