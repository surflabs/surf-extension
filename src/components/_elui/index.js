import {
  // Link,
  // DescriptionsItem,
  // Descriptions,
  // Pagination,
  // Dialog,
  // Autocomplete,
  // Dropdown,
  // DropdownMenu,
  // DropdownItem,
  // Menu,
  // Submenu,
  // MenuItem,
  // MenuItemGroup,
  // Input,
  // InputNumber,
  // Radio,
  // RadioGroup,
  // RadioButton,
  // Checkbox,
  // CheckboxButton,
  // CheckboxGroup,
  // Switch,
  Select,
  Option,
  // OptionGroup,
  // Button,
  // ButtonGroup,
  // Table,
  // TableColumn,
  // DatePicker,
  // TimeSelect,
  // TimePicker,
  Popover,
  // Tooltip,
  // Breadcrumb,
  // BreadcrumbItem,
  // Form,
  // FormItem,
  // Timeline,
  // TimelineItem,
  // Scrollbar,
  // Tabs,
  // TabPane,
  // Tag,
  // Tree,
  // Alert,
  // Slider,
  // Icon,
  // Row,
  // Col,
  // Upload,
  Progress,
  // Badge,
  // Card,
  // Rate,
  // Steps,
  // Step,
  // Carousel,
  // CarouselItem,
  // Collapse,
  // CollapseItem,
  // Cascader,
  // ColorPicker,
  // Transfer,
  // Container,
  // Header,
  // Aside,
  // Main,
  // Footer,
  // Loading,
  // MessageBox,
  Message
  // Notification
} from 'element-ui'

// import AliCoverUpload from '../ali-cover-upload'
// import Arrow from '../arrow'

const elui = {
  // 'e-rate': Rate,
  // 'e-radio': Radio,
  // 'e-radio-group': RadioGroup,
  // 'e-radio-button': RadioButton,
  // 'e-autocomplete': Autocomplete,
  // 'e-badge': Badge,
  // 'e-dialog': Dialog,
  // 'e-dropdown': Dropdown,
  // 'e-dropdown-menu': DropdownMenu,
  // 'e-dropdown-item': DropdownItem,
  // 'e-menu': Menu,
  // 'e-submenu': Submenu,
  // 'e-menu-item': MenuItem,
  // 'e-checkbox': Checkbox,
  // 'e-checkbox-group': CheckboxGroup,
  // 'e-input': Input,
  // 'e-input-number': InputNumber,
  // 'e-button': Button,
  // 'e-button-group': ButtonGroup,
  // 'e-switch': Switch,
  // 'e-form': Form,
  // 'e-form-item': FormItem,
  'e-select': Select,
  // 'e-cascader': Cascader,
  'e-option': Option,
  // 'e-option-group': OptionGroup,
  // 'e-tabs': Tabs,
  // 'e-tab-pane': TabPane,
  // 'e-tag': Tag,
  // 'e-upload': Upload,
  'e-progress': Progress,
  // 'e-ali-cover-upload': AliCoverUpload,
  // 'el-scrollbar': Scrollbar,
  // 'e-row': Row,
  // 'e-col': Col,
  // 'e-table': Table,
  // 'e-table-column': TableColumn,
  // 'e-time-picker': TimePicker,
  // 'e-date-picker': DatePicker,
  // 'e-tree': Tree,
  // 'e-timeline': Timeline,
  // 'e-timeline-item': TimelineItem,
  // 'e-modal': Modal,
  'e-popover': Popover
  // 'e-tooltip': Tooltip,
  // 'e-pagination': Pagination,
  // 'e-descriptions': Descriptions,
  // 'e-descriptions-item': DescriptionsItem,
  // 'e-link': Link
  // 'e-arrow': Arrow
}

const install = function (Vue) {
  Object.keys(elui).forEach((key) => {
    Vue.component(key, elui[key])
  })
  Object.defineProperty(Vue.prototype, '$message', { value: Message })

  // Object.defineProperty(Vue.prototype, '$Loading', { value: LoadingBar })
  // Object.defineProperty(Vue.prototype, '$message', { value: Message })
  // Object.defineProperty(Vue.prototype, '$msgbox ', { value: MessageBox })
  // Object.defineProperty(Vue.prototype, '$confirm', { value: MessageBox.confirm })
  // Object.defineProperty(Vue.prototype, '$Modal', { value: Modal })
  // Object.defineProperty(Vue.prototype, '$Notice', { value: Notice })
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign(elui, { install })
