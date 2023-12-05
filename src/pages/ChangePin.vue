<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col  style="padding-top: 50px">
            <h1>Đăng nhập để đổi mã PIN</h1>
            <v-text-field
              label="Tên đăng nhập / Email"
              variant="outlined"
              placeholder="Ex: safezone@gmail.com hoặc safezone"
              :rules="[rules.required]"
              v-model="username"
            ></v-text-field>
            <v-text-field
              :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show ? 'text' : 'password'"
              @click:append-inner="show = !show"
              label="Mật khẩu"
              variant="outlined"
              placeholder="******"
              :rules="[rules.required]"
              v-model="password"
              class="form-field"
            ></v-text-field>
            <v-snackbar
              v-model="showSnackbar"
              color="red"
              :timeout="5000"
            >
              {{ errorMsg }}
            </v-snackbar>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <div style="position: fixed; bottom: 30px; right: 50px">
    <v-btn size="large" id="btn_cancel" variant="outlined" color="primary" @click="close" :disabled="!canNext">Đóng</v-btn>
    <v-btn size="large" id="btn_submit" color="primary" @click="next" :disabled="!canNext"> Tiếp tục </v-btn>
  </div>
</template>



<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoading } from 'vue-loading-overlay'


const $loading = useLoading()

const router = useRouter()

const rules =  {
        required: value => !!value || 'Không được để trống',
  }

const username = ref('')
const password = ref('')
const canNext = ref(true)
const show = ref(false)
const showSnackbar = ref(false)
const errorMsg = ref("")

const next = async () => {
  
  if (!username.value || !password.value) {
    return
  }

  const loader = $loading.show()

  const res = await window.electron.ipcRenderer.invoke('check-login', {
    username: username.value,
    password: password.value
  })

  loader.hide()

  if (res === true) {
    await router.push({ name: 'set-new-pin' })
  } else {
    errorMsg.value = res
    showSnackbar.value = true
    console.log(res)
  }
}

const close = async () => {
  router.back()
  await window.electron.ipcRenderer.invoke('closeChangePin')
}

</script>

<style scoped>
.form-field {
  margin-top: 20px;
}
</style>
