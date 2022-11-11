export const placeIcon = {
  data () {
    return {
      placMapIconDark: require('@/assets/img/placmap.png'),
      placMapIcon: require('@/assets/img/placmap.png'),
      failMapIconDark: require('@/assets/img/fail-map.png'),
      failMapIcon: require('@/assets/img/fail-map.png'),
      searchMapIcon: require('@/assets/img/record/search.png'),
      searchMapIconDark: require('@/assets/img/record/search-dark.png'),
      unknownDarkImg: require('@/assets/img/unknown.png'),
      unknownImg: require('@/assets/img/unknown.png')
    }
  },
  computed: {
    darkMode () {
      return this.$store.state.theme === 'dark'
    },
    walletIconList () {
      return [
        { icon: require('@/assets/img/wallet-icon/icon1.png'), activeBgColor: 'linear-gradient(92.63deg, #E7F9FF 6.99%, #9BDBFF 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon2.png'), activeBgColor: 'linear-gradient(92.63deg, #E0FFF8 6.49%, #C9EFFE 49.15%, #61BEFF 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon3.png'), activeBgColor: 'linear-gradient(92.63deg, #E6FFF8 3.95%, #DAEBFF 53.22%, #93AFFF 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon4.png'), activeBgColor: 'linear-gradient(92.63deg, #E7F1FC 3.95%, #5B91F1 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon5.png'), activeBgColor: 'linear-gradient(92.69deg, #EAFFFD -25.84%, #C0FDFE 56.5%, #ADFBFF 100.63%)' },
        { icon: require('@/assets/img/wallet-icon/icon6.png'), activeBgColor: 'linear-gradient(92.63deg, #DFFFED 3.95%, #5BDDFF 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon7.png'), activeBgColor: 'linear-gradient(92.63deg, #FFF4EC 3.95%, #FFCF97 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon8.png'), activeBgColor: 'linear-gradient(92.63deg, #F0FFEE 3.95%, #D4FDD6 52.49%, #B1FCB6 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon9.png'), activeBgColor: 'linear-gradient(92.63deg, #F1FFF0 6.99%, #E9FFB3 56.77%, #E9FDA1 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon10.png'), activeBgColor: 'linear-gradient(92.63deg, #F5F6FF 3.95%, #F3EEFF 55.25%, #E2D1FF 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon11.png'), activeBgColor: 'linear-gradient(92.63deg, #F2F2FF 3.95%, #E1DEFF 57.28%, #CDC6FF 101.47%)' },
        { icon: require('@/assets/img/wallet-icon/icon12.png'), activeBgColor: 'linear-gradient(92.63deg, #E3F1FF 3.95%, #A7B0FF 101.47%)' }
      ]
    }
  }
}
