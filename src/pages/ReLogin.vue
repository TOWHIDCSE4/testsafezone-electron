<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <h1>Đăng nhập</h1>
            <p>Vui lòng đăng nhập tài khoản SafeZone.</p>
            <br />
            <br />
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
    <v-btn size="large" color="primary" @click="next" :disabled="!canNext">Đăng nhập</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('hamiacnd@gmail.com')
const password = ref('123123123')
const canNext = ref(true)
const show = ref(false)

const next = async () => {
  const res = await window.electron.ipcRenderer.invoke('login', {
    username: username.value,
    password: password.value
  })

  if (res === true) {
    await router.push({ name: 'device' })
  } else {
    console.log(res)
  }
}
</script>

<style scoped></style>
