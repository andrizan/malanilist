window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js');
  }
}

Vue.createApp({
  data() {
    return {
      upcomingData: "",
      currentData: "",
      loading_og: true,
      loading_up: true,
      requestNow: 0,
      totalPageNow: 0,
      requestUpcoming: 0,
      totalPageUpcoming: 0,
    }
  },
  created: function () {
    this.current();
  },
  // Methods are functions that mutate state and trigger updates.
  // They can be bound as event listeners in templates.
  methods: {
    getData: async function (url) {
      const timer = ms => new Promise(res => setTimeout(res, ms))
      while (true) {
        var result = await fetch(url);
        if (result.ok) break
        await timer(2000);
      }
      return result.json()
    },

    groupBy: function (xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    },

    moreThanOneDayAgo: function (date) {
      const DAY = 1000 * 60 * 60 * 24;
      const dayAgo = Date.now() - DAY;

      return date < dayAgo;
    },

    current: async function () {
      const localCurrent = localStorage.getItem("DB-SeasonNow");
      const expired = localStorage.getItem("DB-SeasonNowCreated");

      if (localCurrent && !this.moreThanOneDayAgo(expired)) {
        this.currentData = JSON.parse(localCurrent);
        this.requestNow = 'local'
      } else {
        var result = [];

        get = await this.getData('https://api.jikan.moe/v4/seasons/now')
        result = result.concat(get.data);

        var total_page = get.pagination.last_visible_page
        this.totalPageNow = total_page;

        const timer = ms => new Promise(res => setTimeout(res, ms))

        let request = 1;
        if (get.pagination.has_next_page) {
          for (var i = 2; i <= total_page; i++) {
            request++
            var rawResponse = await this.getData('https://api.jikan.moe/v4/seasons/now?page=' + i)
            result = result.concat(rawResponse.data);
            await timer(500);
            this.requestNow = request;
          }
        }

        localStorage.setItem('DB-SeasonNowCreated', Date.now())
        localStorage.setItem('DB-SeasonNow', JSON.stringify(result))
        this.currentData = result;
      }

      this.loading_og = false
      this.upcoming()
    },

    upcoming: async function () {
      const localUpcoming = localStorage.getItem("DB-SeasonUpcoming");
      const expired = localStorage.getItem("DB-SeasonUpcomingCreated");

      if (localUpcoming && !this.moreThanOneDayAgo(expired)) {
        this.upcomingData = JSON.parse(localUpcoming);
        this.requestUpcoming = 'local';
      } else {
        var result = [];

        get = await this.getData('https://api.jikan.moe/v4/seasons/upcoming')
        result = result.concat(get.data);

        var total_page = get.pagination.last_visible_page
        this.totalPageUpcoming = total_page;

        const timer = ms => new Promise(res => setTimeout(res, ms))

        let request = 1;
        if (get.pagination.has_next_page) {
          for (var i = 2; i <= total_page; i++) {
            request++
            var rawResponse = await this.getData('https://api.jikan.moe/v4/seasons/upcoming?page=' + i)
            result = result.concat(rawResponse.data);
            await timer(1000);
            this.requestUpcoming = request;
          }
        }

        localStorage.setItem('DB-SeasonUpcomingCreated', Date.now())
        localStorage.setItem('DB-SeasonUpcoming', JSON.stringify(result))
        this.upcomingData = result;
      }

      this.loading_up = false
    },

    date: function (x) {
      if (x == null) {
        return null
      }

      var yourDate = new Date(x);
      const offset = yourDate.getTimezoneOffset()
      yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
      return yourDate.toISOString().split('T')[0]
    },
    numberWithCommas: function (x) {
      if (x == null) {
        return null
      }
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    ratingColor: function (data) {
      return (data.rating == 'PG-13 - Teens 13 or older') ? 'background-color: #f6e58d' : (data.rating == 'R - 17+ (violence & profanity)') ? 'background-color: #ff7979' : (data.rating == 'R+ - Mild Nudity') ? 'background-color: #eb4d4b' : (data.rating == 'PG - Children') ? 'background-color: #badc58' : (data.rating == 'G - All Ages') ? 'background-color: #6ab04c' : '';
    },

    removeLocalStorage: function (key) {
      localStorage.removeItem('DB-Season' + key)
      localStorage.removeItem('DB-Season' + key + 'Created')
      window.location.reload();
      return false
    },
  },
}).mount('#app')

document.addEventListener("DOMContentLoaded", function () {

  el_autohide = document.querySelector('.autohide');

  // add padding - top to bady(if necessary)
  navbar_height = document.querySelector('.autohide').offsetHeight;
  document.body.style.paddingTop = navbar_height + 'px';

  if (el_autohide) {
    var last_scroll_top = 0;
    window.addEventListener('scroll', function () {
      let scroll_top = window.scrollY;
      if (scroll_top < last_scroll_top) {
        el_autohide.classList.remove('scrolled-down');
        el_autohide.classList.add('scrolled-up');
      }
      else {
        el_autohide.classList.remove('scrolled-up');
        el_autohide.classList.add('scrolled-down');
      }
      last_scroll_top = scroll_top;
    });
    // window.addEventListener
  }
  // if

});

function filterOg() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("og");
  filter = input.value.toUpperCase();
  table = document.getElementById("tb-og");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function filterUp() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("up");
  filter = input.value.toUpperCase();
  table = document.getElementById("tb-up");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

//Get the button
var mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
