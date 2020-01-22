<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-text-field
        solo
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-flex>
    <v-flex xs12>
      <v-data-table
        disable-initial-sort
        :items='users'
        :headers='headers'
        :loading='isGettingUsersData'
        :search='search'
        v-model="selected"
        item-key="name"
      >
        <template v-slot:items="props">
          <tr :active="props.selected" @click="props.selected = !props.selected">
            <td>
              <v-btn right icon>
                <v-icon small @click='editUser(props.item)'>edit</v-icon>
              </v-btn>
            </td>
            <td>{{ props.item._id  }}</td>
            <td>{{ props.item.email }}</td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.surname }}</td>
            <td>{{ props.item.role }} </td>
            <td>{{ props.item.company }}</td>
            <td>{{ props.item.createdAt }}</td>
            <td>{{ props.item.logins.length }}</td>
            <td>
              <v-checkbox disabled hide-details class="align-center justify-center" v-model=props.item.archived></v-checkbox>
            </td>
          </tr>
        </template>
      </v-data-table>
          <v-dialog max-width='600'  v-model='showEditDialog'>
            <users-edit-card v-on:close-dialog='closeDialog()' v-on:close-dialog-success='closeDialogSuccess()' v-if='userToEdit != null'  :user='userToEdit'/>
          </v-dialog>
    </v-flex>
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'
import uuid from 'uuid/v4'
import papa from 'papaparse'
import UsersEditCard from '../components/UserEditCard'

export default {
  name: 'AdminUsersView',
  components: {
    UsersEditCard
  },
  watch: {
  },
  computed: {
    users( ) {
      return this.$store.state.admin.users
    },
  },
  data( ) {
    return {
      usersResource: [],
      isGettingUsersData: false,
      selected: [],
      userToEdit: null,
      search:'',
      headers: [
        { text: 'Edit', value: '' },
        { text: 'Id', value: '_id'},
        { text: 'Email', value: 'email'},
        { text: 'Name', value: 'name'},
        { text: 'Surname', value: 'surname' },
        { text: 'Role', value: 'role'},
        { text: 'Company', value: 'company'},
        { text: 'Joined', value: 'name'},
        { text: 'Logins', value: 'logins.length' },
        { text: 'Archived', value: 'archived' },
      ],
      showEditDialog: false
    }
  },
  methods: {
    editUser(user){
      this.showEditDialog = true
      this.userToEdit = user
    },
    closeDialog(){
      this.showEditDialog = false
    },
    closeDialogSuccess(){
      this.showEditDialog = false
    }
  },
  mounted( ) {
  }
}

</script>
<style scoped lang='scss'>

.detail-card {
  margin-bottom: 20px;
}

.md-content {
  padding: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.md-card-content {
  padding: 0;
}

a:hover {
  cursor: pointer;
}

</style>
