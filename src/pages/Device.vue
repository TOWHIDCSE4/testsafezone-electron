<template>
  <v-card flat>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col cols="6">
            <h1>Người sử dụng</h1>
            <p v-if="!initiating && children.length <= 0">
              Tài khoản chưa thêm thành viên!<br />
              Vui lòng vào trang quản lý thêm mới.<br />
              <v-btn color="primary" @click="reload" style="margin: 10px 0 !important">
                Cập nhật danh sách
              </v-btn>
            </p>
            <v-list>
              <v-list-item
                v-for="child in children"
                :key="child['id']"
                :class="{
                  'text-success': childrenId === child['id']
                }"
              >
                <template v-slot:prepend>
                  <span class="mdi mdi-check-decagram" v-if="childrenId === child['id']"></span>
                  <span class="mdi mdi-face-man" v-else-if="child['gender'] === 'MALE'"></span>
                  <span class="mdi mdi-face-woman" v-else></span>
                </template>
                <template v-slot:append>
                  <v-btn
                    variant="outlined"
                    @click="childrenId = child['id']"
                    :disabled="childrenId === child['id']"
                    size="small"
                    >Chọn</v-btn
                  >
                </template>
                <v-list-item-title>{{ child['name'] }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="6">
            <h1>Thông tin thiết bị</h1>
            <v-text-field label="Tên thiết bị" variant="solo" v-model="device.name"></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
  <div style="position: fixed; bottom: 30px; right: 50px">
    <v-btn size="large" color="primary" @click="next" :disabled="!canNext"> Tiếp tục </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoading } from 'vue-loading-overlay'

const $loading = useLoading()

const router = useRouter()

const device = ref({
  id: '',
  name: '',
  platform: ''
})
const childrenId = ref('')
const initiating = ref(true)
const children = ref([])
const canNext = computed(() => childrenId.value !== '' && device.value.name.length > 0)

onMounted(() => {
  nextTick(async () => {
    const loader = $loading.show()
    device.value = await window.electron.ipcRenderer.invoke('device')
    children.value = await window.electron.ipcRenderer.invoke('children')
    loader.hide()
    initiating.value = false
  })
})

const reload = async () => {
  const loader = $loading.show()
  children.value = await window.electron.ipcRenderer.invoke('children')
  loader.hide()
}

const next = async () => {
  const loader = $loading.show()
  const res = await window.electron.ipcRenderer.invoke('deviceNew', {
    childId: childrenId.value,
    name: device.value.name,
    type: 'PC',
    platform: device.value.platform,
    hardwareId: device.value.id
  })
  loader.hide()
  if (res === true) {
    await router.push({ name: 'done' })
  } else {
  }
}
</script>

<style>
.mdi {
  font-size: 24px;
  margin-right: 10px;
}
</style>
