import {
  Toast,
  Button,
  Loading,
  Icon,
  Image,
  // Uploader,
  Slider,
  Form,
  Field,
  Checkbox,
  Switch,
  search,
  RadioGroup,
  Radio,
  Popup,
  Popover,
  ActionSheet,
  Circle,
  // DropdownMenu,
  // DropdownItem,
  // IndexBar,
  // IndexAnchor,
  Cell,
  // Picker,
  // Overlay,
  List,
  PullRefresh,
  ImagePreview,
  Skeleton
} from 'vant'

// import {
//   Message,
//   Progress
// } from 'element-ui'

// import CoverUpload from '../cover-upload'
// import Arrow from '../arrow'

const mui = {
  Button,
  Loading,
  Icon,
  Image,
  search,
  // Uploader,
  Slider,
  Form,
  Field,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
  Popup,
  Popover,
  ActionSheet,
  Circle,
  // DropdownMenu,
  // DropdownItem,
  // IndexBar,
  // IndexAnchor,
  Cell,
  // Picker,
  // Overlay,
  List,
  PullRefresh,
  ImagePreview,
  Skeleton
  // 'm-cover-upload': CoverUpload,
  // 'm-arrow': Arrow
}

const install = function (Vue) {
  Object.keys(mui).forEach((key) => {
    const n = mui[key].name
    if (n.indexOf('van-') === 0) {
      Vue.component('m' + n.substr(3), mui[key])
    } else {
      Vue.component(n, mui[key])
    }
  })

  // Vue.component('m-progress', Progress)
  Object.defineProperty(Vue.prototype, '$toast', { value: Toast })
  // Object.defineProperty(Vue.prototype, '$message', { value: Message })
  Object.defineProperty(Vue.prototype, '$imagePreview', { value: ImagePreview })
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign(mui, { install })
