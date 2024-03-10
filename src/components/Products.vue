<template>
    <div class="container">

        <div class="testContainer">
            <a v-bind:href="serverURL">HTTPS TEST</a>
            <button @click="deleteAllCaches" style="width: 100px;">Delete All Caches</button>
            <button @click="unregister" style="width: 100px;">unregister All ServiceWorkers</button>
            <button @click="reloadPage" style="width: 100px;">Reload Page</button>
        </div>


        <div class="subcontainer">
            <div v-for="product in products" class="row product">

                <div class="products-container">
                    <div class="col col-expand">

                        <p><strong>Subject: </strong>{{ product.subject }}</p>
                        <p><strong>Location: </strong> {{ product.location }}</p>
                        <p><strong>Price: </strong>{{ product.price | formatPrice }}</p>
                        <p><strong>Spaces available: </strong>{{ product.spaces }}</p>
                    </div>
                    <div class="col">
                        <figure>
                            <img v-bind:src="product.img" v-bind:alt="product.imgAlt">
                        </figure>

                    </div>
                </div>


                <div class="add-btn-container" v-if="canAddToCart(product)">
                    <button class="add-btn" v-on:click="addItemToCart(product)">
                        Add to Cart
                    </button> <span v-if="product.spaces < 5">Only {{ product.spaces }} left</span>
                    <span v-else-if="product.spaces >= 5">Buy Now!</span>

                </div>

                <div v-else>
                    <button class="disabled" disabled='disabled'>
                        Add to Cart
                    </button> <span v-if="product.spaces <= 0">Out of Stock</span>
                </div>

            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: ['serverURLProp', "products", "addToCart", "cartCount", "canAddToCart", "cartItemCount", "searchResults"],
    data() {
        return {
            serverURL: `https://afterschoolclub.eu-west-2.elasticbeanstalk.com/collections/products`,
        }
    },

    methods: {
        reloadPage() {

            window.location.reload()

        },

        unregister() {

            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister()
                }
            })

            console.log("Unregisted");

        },


        deleteAllCaches() {

            caches.keys().then(function (names) {
                for (let name of names) {
                    caches.delete(name)
                }
            })
            console.log("All caches deleted");
        },

        addItemToCart(product) {

            this.$emit("add-item-to-cart", product)
        },


    },




    filters: {
        formatPrice: function (price) {
            if (!parseInt(price)) {
                return "";
            }
            if (price > 99999) {
                let priceString = (price / 1).toFixed(2);
                let priceArray = priceString.split("").reverse();
                let index = 3;
                while (priceArray.length > index + 3) {
                    priceArray.splice(index + 3, 0, ", ");
                    index += 4;
                }
                return "£" + priceArray.reverse().join("");
            } else {
                return "£" + (price / 1).toFixed(2);
            }
        }
    }


}
</script>

<style></style>