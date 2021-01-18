<template>
  <div id="try-now" class="section">
    <div class="section-wrap">
      <h3 class="mb-5 text-center">TRY NOW</h3>
      <p class="text-center">
        EduVault is still in development. The alpha app is located here:
      </p>
      <a
        class="text-center block border-orange border text-orange py-1 px-2 my-2 w-32 rounded mx-auto cursor-pointer"
        :href="appLink"
      >
        TRY ALPHA
      </a>
      <p class="text-center">
        FlashyCards is a mini app built to showcase syncing app data with
        EduVault
      </p>
      <a
        :href="exampleLink"
        class="text-center block bg-orange text-white py-1 px-2 my-2 w-48 rounded mx-auto cursor-pointer"
      >
        TRY EXAMPLE APP
      </a>
      <p class="mb-3 text-center">
        Send us an <a href="info@eduvault.org" class="link">email</a> to be
        alerted of future releases.
      </p>

      <h3 class="mb-5 mt-10 text-center">Inter Planetary Flash Cards</h3>
      <p class="mb-3">
        <a class="link" href="https://ipfc.tech">Inter Planetary Flash Cards</a>
        (IPFC) is an app developed by us, and will be the first app to integrate
        EduVault login and cloud sync. Experience the value of being able to
        take your educational data with you around the internet by trying out
        IPFC’s flashcard app and
        <a
          href="https://chrome.google.com/webstore/detail/inter-planetary-flash-car/ffjpplmcceibehbaofplbmcldkmmhcob?hl=en"
          class="link"
          >browser extension</a
        >.
      </p>
      <div class="grid sm:grid-cols-2 m-auto">
        <a class="my-auto pb-5" href="https://www.ipfc.tech">
          <img
            class="max-w-xxs md:max-w-sm mx-auto mt-5"
            src="@/assets/img/ipfc-demo.gif"
            alt=""
          />
          <figcaption class="mx-auto text-center text-gray-500">
            IPFC flashcard app
          </figcaption></a
        >

        <a
          class="my-auto pb-5"
          href="https://chrome.google.com/webstore/detail/inter-planetary-flash-car/ffjpplmcceibehbaofplbmcldkmmhcob?hl=en"
        >
          <img
            class="max-w-xxs md:max-w-sm mx-auto"
            src="@/assets/img/ipfc-extension-demo.gif"
            alt=""
          />
          <figcaption class="mx-auto text-center text-gray-500">
            IPFC browser extension
          </figcaption>
        </a>
      </div>

      <h3 class="my-5 text-center">HackFS MVP</h3>
      <p class="mb-3">
        Our team won the competitive ‘best use of Textile ThreadDB’ prize in the
        Eth Global/Protocol Labs Filecoin HackFS hackathon. The hackathon
        <a
          href="https://hack.ethglobal.co/showcase/eduvault-rec0AsnWL4MKtqkyJ"
          class="link"
          >project</a
        >
        was a simple MVP and sneak peak of what EduVault will look like.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { EDUVAULT_APP_URL, EXAMPLE_APP_URL } from '../../config'
export default Vue.extend({
  data() {
    return {
      appLink: EDUVAULT_APP_URL,
      exampleLink: EXAMPLE_APP_URL,
    }
  },
})
</script>
