import store from '@/store'

export function hasAdminPermission(values) {
  return {
    data() {
      return {
        hasAdminPermission: false
      }
    },
    created() {
      let permissionRoles = ['admin']
      if (values && values instanceof Array) {
        if (values.length > 0) {
          permissionRoles = values
        }
      }
      const roles = store.getters && store.getters.roles
      console.log(roles)
      this.hasAdminPermission = roles.some(role => permissionRoles.includes(role))
      console.log(this.hasAdminPermission)
    }
  }
}

export default { hasAdminPermission }
