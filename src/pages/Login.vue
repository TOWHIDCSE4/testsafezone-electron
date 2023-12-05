<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <h1>Đăng nhập</h1>
            <p>Vui lòng đăng nhập tài khoản mà bạn đã tạo.</p>
          </v-col>
          <v-col cols="6" style="padding-top: 50px">
            <v-text-field
              label="Tên đăng nhập / Email"
              variant="solo"
              placeholder="Ex: safezone@gmail.com hoặc safezone"
              v-model="username"
            ></v-text-field>
            <v-text-field
              :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show ? 'text' : 'password'"
              @click:append-inner="show = !show"
              label="Mật khẩu"
              variant="solo"
              placeholder="******"
              v-model="password"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <div style="position: fixed; bottom: 30px; right: 50px">
    <v-btn size="large" variant="outlined" color="primary" to="/welcome"> Quay lại </v-btn>
    <v-btn size="large" color="primary" @click="next" :disabled="!canNext"> Tiếp tục </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoading } from 'vue-loading-overlay'

const $loading = useLoading()

const router = useRouter()

const username = ref('')
const password = ref('')
const canNext = ref(true)
const show = ref(false)

const next = async () => {
  const loader = $loading.show()

  const res = await window.electron.ipcRenderer.invoke('login', {
    username: username.value,
    password: password.value
  })

  loader.hide()

  if (res === true) {
    await router.push({ name: 'device' })
  } else {
    console.log(res)
  }
}
</script>

<style scoped></style>
