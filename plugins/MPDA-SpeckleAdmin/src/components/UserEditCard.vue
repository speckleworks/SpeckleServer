<template>
  <v-card>
    <v-container>
      <v-card-title>
        <span class="headline font-weight-light">Edit User</span>
        <v-spacer />
        <v-btn icon @click="closeDialog">
          <v-icon>close</v-icon>
        </v-btn>
        
      </v-card-title>
      <v-card-title>
        <v-flex xs12>
          <v-progress-linear indeterminate v-if="showProgress" />
          <v-form>
            <v-layout row wrap>
              <v-flex xs12 md6>
                <v-text-field v-model="user.name" label="Name" required></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field v-model="user.surname" label="Surname" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="user.email" label="Email" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="user.company" label="Company" required></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-select v-model="user.role" :items="['user', 'admin']" label="Role" required></v-select>
              </v-flex>
              <v-layout justify-end>
                <v-flex xs12 md6>
                  <v-spacer/>
                  <v-switch v-model="user.archived" label="Archived" required></v-switch>
                </v-flex>
              </v-layout>
            </v-layout>
          </v-form>
        </v-flex>
      </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :disabled="true">Reset Password</v-btn>
        <v-btn color="primary" @click="saveUser" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-container>
  </v-card>
</template>
<script>
import Axios from 'axios'

export default {
  name: "UserEditCard",
  props: {
    user: Object
  },
  computed: {
    valid() {
      if (
        this.user.name.length < 1 ||
        this.user.surname.length < 1 ||
        this.user.company.length < 1 ||
        (this.user.role != "admin" && this.user.role != "user") ||
        this.user.email.length < 1
      ) {
        //TODO real email validation
        return false;
      }
      return true;
    }
  },
  data() {
    return {
      showProgress: false
    };
  },
  methods: {
    saveUser() {
      this.showProgress = true
      let payload = {
        _id: this.user._id,
        name: this.user.name,
        surname: this.user.surname,
        company: this.user.company,
        email: this.user.email,
        role: this.user.role,
        archived: this.user.archived
      };
      this.$store.dispatch('updateUserAdmin', payload)
      .then (() => {
        this.showProgress = false
        this.$emit('close-dialog')
      })
    },
    closeDialog() {
      this.$emit("close-dialog");
    }
  },
};
</script>
<style scoped lang='scss'>
</style>
