<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <h1>Cảm ơn bạn đã sử dụng SafeZone!</h1>
            <p>
              Để bảo vệ con khỏi nội dung độc hại, vui lòng chọn "Đã có tài khoản" nếu bạn đã có tài
              khoản SafeZone, hoặc "Chưa có tài khoản" để tạo tài khoản mới, rồi ấn nút Tiếp tục.
            </p>
            <br />
            <br />
            <v-radio-group v-model="account">
              <v-radio label="Đã có tài khoản" color="primary" value="yes"></v-radio>
              <v-radio label="Chưa có tài khoản" color="primary" value="no"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <div style="position: fixed; bottom: 30px; right: 50px">
    <v-btn size="large" color="primary" @click="next"> Tiếp tục </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const account = ref('yes')

const next = async () => {
  if (account.value === 'yes') {
    await router.push({ name: 'login' })
  } else {
    await window.electron.ipcRenderer.invoke('register')
  }
}
</script>

<style scoped></style>
