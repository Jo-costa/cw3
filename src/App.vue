<template>
  <div id="app">
    <nav>
      <h1 v-text="sitename"></h1>

      <button class="checkout" v-if="cartItemCount > 0" @click="showCheckOut">
        <span class="qty">{{ cartItemCount }}</span>
        <font-awesome-icon icon="fa-solid fa-cart-shopping" />
        Checkout
      </button>


      <button class="checkout-disabled" disabled="disabled" v-else>
        <font-awesome-icon icon="fa-solid fa-cart-shopping" />
        Checkout
      </button>

    </nav>
    <div class="search-main-container" v-if="currentView.name === 'products-view'">
      <div class="search-container">
        <div class="search">
          <input type="text" class="search-field" placeholder="Search" v-model="search">
        </div>


      </div>
      <ul>
        <li v-for="item in searchResults" :key="item.id">
          {{ item.subject }}
        </li>
      </ul>
    </div>

    <main>
      <component :is="currentView" :order="order" @show-products="showCheckOut" :remove-items="removeAlItems"
        @remove-all-from-cart="removeAllItemsFromCart" :basketForm="basketForm" @place-order="placeOrder"
        :updateBasketInfo="updateBasketInfo" :currentView="currentView" :removeAlItems="removeAlItems"
        :decrease="decrease" :increase="increase" :getProdID="getProdID" :getProdImg="getProdImg" :cart="cart"
        :addToCart="addToCart" :cartCount="cartCount" :canAddToCart="canAddToCart" :cartItemCount="cartItemCount"
        :products="products" :searchResults="searchResults" @add-item-to-cart="addToCart"
        @can-add-item-to-cart="canAddToCart" :search="search">


      </component>

    </main>
  </div>
</template>

<script>
import Products from './components/Products.vue'
import Checkout from './components/Checkout.vue'

export default {
  name: 'App',
  components: {
    Products, Checkout,
  },

  data() {
    return {
      sitename: "After School Club",
      cart: [],
      currentView: Products,
      search: "",
      searchResults: [],
      products: [],
      basketForm: [],
      userDetailsForm: [],
      order: {
        firstName: null,
        phone: null,
      },


    }
  },

  created: function () {

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").then(
        (registration) => {
          console.log("Service worker registration succeeded:", registration);
        },
        (error) => {
          console.error(`Service worker registration failed: ${error}`);
        },
      );
    } else {
      console.error("Service workers are not supported.");
    }

    fetch(`https://afterschoolclub.eu-west-2.elasticbeanstalk.com/collections/products`)
      .then(response => response.json())
      .then(json => {
        this.products = json
      })

  },

  watch: {
    search: function () {
      if (this.search.length > 0) {
        fetch(`https://afterschoolclub.eu-west-2.elasticbeanstalk.com/collections/products/search?query=${this.search}`)
          .then(response => response.json())
          .then(json => {
            this.products = json
            this.cart = [];
          })
      } else {
        fetch(`https://afterschoolclub.eu-west-2.elasticbeanstalk.com/collections/products`)
          .then(response => response.json())
          .then(json => {
            this.products = json
            this.cart = [];
          })
      }
    }
  },

  methods: {

    updateBasketInfo() {

      //iterate cart array retreive each item 
      this.cart.forEach((element) => {

        //store retreived item in the array
        this.basketForm.push({
          itemsInfo: {
            id: element.id,
            numSpaces: element.qty,
            updateInventory: element.availableInventory
          }
        })
      })



    },

    placeOrder() {

      //fucntion call to insert items(id, spaces and item-inventory) in the cart array to basketForm array
      this.updateBasketInfo()


      console.log("Passed!");

      //retrieve user details and insert into the userDetailsForm array
      this.userDetailsForm.push({
        firstName: this.order.firstName,
        phone: this.order.phone,
      })


      console.log("Passed1!");


      const basketData = [];
      const updateSpacesArray = []

      //iterate basketForm array that contains info about (id, spaces and item-inventory)
      this.basketForm.forEach((item) => {
        const lessonID = item.itemsInfo.id;
        const numSpaces = item.itemsInfo.numSpaces;
        const updateSpaces = item.itemsInfo.updateInventory - numSpaces;

        //insert retrieved data into the basketData array
        basketData.push({
          productID: lessonID,
          numSpaces: numSpaces,

        })


        console.log("Passed!" + item);

        updateSpacesArray.push({
          productID: lessonID,
          updateInv: updateSpaces,

        })

        console.log("Passed2" + item);


      });

      //array to hold all the info to be sent to the server
      const orderInfo = {
        firstName: this.userDetailsForm[0].firstName,
        phone: this.userDetailsForm[0].phone,
        basketData
      };




      fetch(`https://afterschoolclub.eu-west-2.elasticbeanstalk.com/collections/orders/orderPlaced`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          orderInfo
        })
      })
        .then((response) => response.json())
        .then(data => {

          fetch(`https://store-env.eba-xvfgdgap.eu-west-2.elasticbeanstalk.com/collections/products`, {

            method: "PUT",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },

            body: JSON.stringify({
              updateSpacesArray
            })
          })
            .then((response) => response.json())
            .then(data => { }) //end of fetch PUT

          alert(data.msg)
          location.reload()

        })
        .catch(error => {
          console.error("Error:", error);
        })




    },

    showCheckOut() {

      if (this.currentView === Products) {
        this.currentView = Checkout
      } else {
        this.currentView = Products

      }
    },


    increase: function (product) {

      //find the product in the products array
      let getItem = this.products.find((element) => element.id == product.id);

      //check if the found product spaces is greater than 0
      if (getItem.spaces > 0) {
        product.qty++;
        getItem.spaces--;

      }
    },

    decrease: function (product) {
      //find the product in the products array
      let getItem = this.products.find((element) => element.id == product.id);

      if (product.qty <= 1) {

        //check if each item in the cart array is not equal to the id of the product
        //to be deleted... create a new array without the deleted item and assign to cart array
        this.cart = this.cart.filter(item => !(item.id === product.id))
        getItem.spaces++;
      } else {
        product.qty--;
        getItem.spaces++;
      }

    },

    removeAlItems: function (product) {

      let getItem = this.products.find((element) => element.id == product.id);

      this.cart = this.cart.filter(item => !(item.id === product.id))

      getItem.spaces = product.availableInventory;

    },

    removeAllItemsFromCart: function (cart) {

      const deleteAll = cart.map(item => item.id);

      this.products.forEach(product => {
        if (deleteAll.includes(product.id)) {

          const removedItem = cart.find(item => item.id === product.id);

          if (removedItem) {
            product.spaces = removedItem.availableInventory
          }

        }

      })

      cart.splice(0, cart.length)



      console.log("Clicked");
    },

    addToCart: function (product) {
      let getItem = this.products.find((element) => element.id == product.id);


      //find a product in the cart array where the id matches the product id
      const alreadyInCart = this.cart.findIndex(item => item.id === product.id)

      //findIndex returns -1 if no match is found
      //if product is not in cart, add to cart, else increment its qty
      if (alreadyInCart !== -1) {
        this.cart[alreadyInCart].qty++;
      } else {
        this.cart.push({
          id: product.id,
          qty: 1,
          subject: product.subject,
          availableInventory: product.spaces
        })
      }

      product.spaces--;
    },

    canAddToCart: function (product) {
      return product.spaces > 0;

    },

    cartCount: function (id) {
      let count = 0;
      for (let i = 0; i < this.cart.length; i++) {
        if (this.cart[i] === id) {
          count++
        }
      }

      return count;

    },



    getProdID: function (id) {

      let getItem = this.products.find((element) => element.id == id.id);



      return getItem
    },

    getProdImg: function (id) {

      let prod = this.getProdID(id);

      return prod.img
    },

    getProdQty(id) {


      let count = 0;

      for (let i = 0; i < this.cart.length; i++) {
        if (this.cart[i] === id) {
          count++;
        }
      }

      return count;
    },

  },



  computed: {

    isValid: function () {

      if ((this.order.firstName && this.order.phone !== null) && this.cart.length > 0) {
        this.valid = true;

      } else {
        this.valid = false;
      }

      return this.valid;
    },

    cartItemCount: function () {
      let totalQty = 0;

      for (let i = 0; i < this.cart.length; i++) {
        if ('qty' in this.cart[i]) {
          totalQty += this.cart[i].qty;
        }
      }

      return totalQty;
    },



    searched: function () {
      let searchProducts = this.products.filter((product) => {

        return product.subject.match(this.search);
      })

      return searchProducts;
    },

  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
