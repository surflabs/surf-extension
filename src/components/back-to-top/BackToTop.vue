<template>
  <div :class="classs" :style="{ bottom }" @click="toTop" />
</template>

<script>
export default {
  name: 'BackToTop',
  props: {
    targetNode: {
      required: true
    },
    scrollContainer: {
      required: true
    },
    bottom: {
      type: String,
      default: '96px'
    }
  },
  data () {
    return {
      show: false,
      classs: '',
      timedate: ''
    }
  },
  destroyed () {
    this.scrollContainer &&
    this.scrollContainer.removeEventListener('scroll', this.scrollHandler)
  },
  watch: {
    scrollContainer (node) {
      if (node) {
        node.addEventListener('scroll', this.scrollHandler)
      }
    },
    '$route.name' (val) {
      if (val === 'home' && this.scrollContainer && this.scrollContainer.scrollTop === 0) {
        this.show = false
      }
    },
    'show' (n, o) {
      if (n) {
        this.classs = 'mui-scroll-top taplight animation'
        clearTimeout(this.timedate)
      } else {
        this.classs = 'mui-scroll-top taplight hide-animation'
        this.timedate = setTimeout(() => {
          this.classs = this.classs + ' amnnone'
        }, 280)
      }
    }
  },
  methods: {
    toTop () {
      this.targetNode.scrollIntoView({ block: 'start', behavior: 'smooth' })
    },
    scrollHandler () {
      this.show = this.scrollContainer.scrollTop >= 400
    }
  }
}
</script>
