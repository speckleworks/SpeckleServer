# SpeckleAdmin Plugins!
This folder is scanned for components that will be added dynamically to SpeckleAdmin's `/plugins` route.
* Only components that have the prefix `plugin-` will be added, so it's important that your parent component follow this naming pattern! 
* We parse PascalCase to kebabCase to get the route path, so make sure your Vue component is named appropriately. 
* E.g. a Vue component with filename `plugin-FirstPlugin.vue` and a `name: 'FirstPlugin'` property will be served at `/plugins/first-plugin`
