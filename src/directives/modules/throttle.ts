/*
  需求：防止按钮在短时间内被多次点击，使用节流函数限制规定时间内只能点击一次。

  思路：
    1、第一次点击，立即调用方法并禁用按钮，等延迟结束再次激活按钮
    2、将需要触发的方法绑定在指令上
  
  使用：给 Dom 加上 v-throttle 及回调函数即可
  <button v-throttle="debounceClick">节流提交</button>
*/
import type { Directive, DirectiveBinding } from 'vue';
interface ElType extends HTMLElement {
  __handleClick__: () => any;
  disabled: boolean;
}
const throttle: Directive = {
  mounted(el: ElType, binding: DirectiveBinding) {
    if (typeof binding.value !== 'function') {
      throw 'callback must be a function';
    }
    let isThrottling = false;
    el.__handleClick__ = function () {
      if (isThrottling) return;
      
      isThrottling = true;
      const originalDisabled = el.disabled;
      const originalLoading = el.getAttribute('data-loading');
      
      // 强制启用disabled状态
      el.disabled = true;
      if (originalLoading === 'true') {
        el.setAttribute('data-loading', 'false');
      }
      
      binding.value();
      
      setTimeout(() => {
        // 恢复原始状态
        el.disabled = originalDisabled;
        if (originalLoading === 'true') {
          el.setAttribute('data-loading', 'true');
        }
        isThrottling = false;
      }, 1000);
    };
    el.addEventListener('click', el.__handleClick__);
  },
  beforeUnmount(el: ElType) {
    el.removeEventListener('click', el.__handleClick__);
  },
};

export default throttle;
