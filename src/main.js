import Vue from 'vue'
import App from './App.vue'
// import 'service-worker.js'
import Products from './components/Products.vue'
import Checkout from './components/Checkout.vue'


import {
  library
} from '@fortawesome/fontawesome-svg-core';
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome';
import {
  fas
} from '@fortawesome/free-solid-svg-icons';

//add icons to library
library.add(fas);


Vue.config.productionTip = false
Vue.component('products-view', Products)
Vue.component('checkout-view', Checkout)
Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  render: function (h) {
    return h(App)
  },
}).$mount('#app')