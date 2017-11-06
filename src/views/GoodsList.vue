<template>
    <div>
      <!--Header component-->
      <nav-header></nav-header>
      <!--BreadCrumb component-->
      <nav-bread>
        <span slot="goods">Goods</span>
      </nav-bread>

      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a href="javascript:void(0)" class="price" @click="sortGoods">Price
              <svg class="icon icon-arrow-short" v-bind:class="{'sort-up': !sortFlag}">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-short"></use>
              </svg>
            </a>
            <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">

            <!-- filter -->
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show': filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" v-bind:class="{'cur':priceChecked=='all'}" @click="setPriceFilter('all')">All</a></dd>
                <dd v-for="(price,index) in priceFilter">
                  <a href="javascript:void(0)" @click="setPriceFilter(index)" v-bind:class="{'cur':priceChecked==index}">{{price.startPrice}} - {{price.endPrice}}</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="item in goodsList">
                    <div class="pic">
                      <a href="#"><img v-lazy="'/static/' + item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">Add to cart</a>
                      </div>
                    </div>
                  </li>
                </ul>
                <div class="load-more" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
                  <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
      <!--Modal-->
      <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
        <p slot="message">
          Please login in first.
        </p>
        <div slot="btnGroup">
          <a class="btn btn--m" href="javascript:;" @click="mdShow=false">Close</a>
        </div>
      </modal>

      <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
        <p slot="message">
          <svg class="icon-status-ok">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
          </svg>
          <span>Add to cart successfully.</span>
        </p>
        <div slot="btnGroup">
          <a class="btn btn--m" href="javascript:;" @click="mdShowCart=false">Keep shopping</a>
          <router-link class="btn btn--m" href="javascript:;" to="/cart">Check your cart</router-link>
        </div>
      </modal>
      <!--Footer component-->
      <nav-footer></nav-footer>

    </div>

</template>
<style>
  .btn:hover{
    background-color: #ff1516;
    transition: all .3s ease-out;
  }
</style>
<script>
  import './../assets/css/base.css'
  import './../assets/css/product.css'
  import NavHeader from '../components/NavHeader.vue'
  import NavFooter from './../components/NavFooter.vue'
  import NavBread from './../components/NavBread.vue'
  import Modal from './../components/Modal.vue'
  import axios from 'axios'

  export default{
      data() {
          return {
              goodsList: [],
              sortFlag: true,
              page: 1,
              pageSize: 8,
              mdShow: false,
              mdShowCart: false,
              priceFilter: [
                {
                  startPrice: '0.00',
                  endPrice: '500.00'
                },
                {
                  startPrice: '500.00',
                  endPrice: '1000.00'
                },
                {
                  startPrice: '1000.00',
                  endPrice: '2000.00'
                },
                {
                    startPrice: '2000.00',
                    endPrice: '5000.00'
                }
              ],
              priceChecked: 'all',
              filterBy: false,
              overLayFlag: false,

              busy: true,

              loading: false

          }
      },
      components:{
          NavHeader: NavHeader,
          NavFooter: NavFooter,
          NavBread: NavBread,
          Modal: Modal
      },
      mounted: function() {
          this.getGoodsList();
      },
      methods: {
          getGoodsList(flag){
              var param = {
                  page: this.page,
                  pageSize: this.pageSize,
                  sort: this.sortFlag ? 1 : -1,
                  priceLevel: this.priceChecked
              }
              this.loading = true;
              axios.get("/goods", {
                  params: param
              }).then((result)=>{
                  this.loading = false;
                  let res = result.data;
                  if (res.status == '0') {
                      if (flag) {
                        this.goodsList = this.goodsList.concat(res.result.list);

                        if (res.result.count == 0) {
                            this.busy = true;
                        } else {
                            this.busy = false;
                        }
                      } else {
                        this.goodsList = res.result.list;
                        this.busy = false;
                      }
                  } else {
                      this.goodsList = [];
                  }
              });
          },
          showFilterPop(){
              this.filterBy = true;
              this.overLayFlag = true;
          },
          closePop(){
              this.filterBy = false;
              this.overLayFlag = false;
          },
          setPriceFilter(index){
              this.priceChecked=index;
              this.closePop();
              this.page = 1;
              this.getGoodsList();

          },
          sortGoods() {
              this.sortFlag = ! this.sortFlag;
              this.page = 1;
              this.getGoodsList();
          },
          loadMore() {
              this.busy = true;

              setTimeout(()=>{
                this.page++;
                this.getGoodsList(true);
//                  for (var i = 0, j = 10; i < j; i++) {
//                      this.data.push({name: count++});
//                  }
//                  this.busy = false;
              }, 1000);
          },
          addCart(productId) {
              axios.post('/goods/addCart', {
                  productId: productId
              }).then((res)=>{
                  var res = res.data;
                  if (res.status == '0') {
                      this.mdShowCart = true;
                      this.$store.commit("updateCartCount", this.$store.state.cartCount + 1);
                  } else {
//                      alert("msg: " + res.msg);
                      this.mdShow = true;
                  }
              });
          },
          closeModal() {
              this.mdShow = false;
          }
      }
  }
</script>
