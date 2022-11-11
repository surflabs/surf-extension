export function placeholder (el, binding) {
  if (!el.querySelector('.mui-holder')) {
    const ndP = document.createElement('p')
    ndP.classList.add('mui-holder')
    ndP.innerText = binding.value
    el.appendChild(ndP)
  }

  const ndInp = el.querySelector('input') || el.querySelector('textarea')
  ndInp.addEventListener('focus', function (e) {
    el.classList.add('fold-holder')
  })

  if (typeof binding.arg !== 'undefined' || ndInp.value) {
    el.classList.add('fold-holder')
  }

  if (typeof binding.arg !== 'undefined' && binding.arg === '' && document.activeElement !== ndInp) {
    el.classList.remove('fold-holder')
  }

  ndInp.addEventListener('blur', function (e) {
    if ((typeof binding.arg === 'undefined' && !this.value) || (typeof binding.arg !== 'undefined' && binding.arg === '')) {
      el.classList.remove('fold-holder')
    } else {
      el.classList.add('fold-holder')
    }
  })
}

export function focus () {
  return {
    inserted (el, binding) {
      if (!(typeof binding.value === 'boolean' && !binding.value)) {
        el && setTimeout(() => el.focus(), 405)
      }
    }
  }
}

const directives = {
  placeholder,
  focus: focus()
}

const install = function (Vue) {
  Object.keys(directives).forEach(key => {
    Vue.directive(key, directives[key])
  })
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default Object.assign(directives, { install })
