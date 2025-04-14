<!--脉冲组件（用于显示状态）--->
<template>
  <div
    class="status"
    :class="['status-' + props.type, 'status-size-' + props.size]"
  >
    <span class="status-dot" :class="{ 'status-dot-processing': pulse }"></span>
    <label v-if="props.label && props.label.length > 0" class="status-label">
      {{ props.label }}
    </label>
  </div>
</template>

<script setup lang="ts" name="Status">
// 外部传递的值
interface StatusProps {
  type?: 'primary' | 'success' | 'warning' | 'error'; // 搜索配置列
  size?: 'mini' | 'small' | 'medium' | 'large';
  label?: string;
  pulse?: boolean;
}

// Props 的默认值
const props = withDefaults(defineProps<StatusProps>(), {
  type: 'primary',
  size: 'medium',
  pulse: true,
});
</script>

<style lang="less" scoped>
.status {
  display: flex;
  align-items: center;

  &-dot {
    display: inline-block;
    background: #000;
    border-radius: 9999px;
    vertical-align: middle;

    &-processing {
      position: relative;
    }
    &-processing:after {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: inherit;
      content: '';
      animation: warn 1.2s ease-in-out infinite;
    }
  }
  &-label {
    margin-left: 4px;
  }

  &-primary {
    & > .status-dot {
      background: var(--td-brand-color);
    }
    & > .status-label {
      color: var(--td-brand-color);
    }
  }

  &-success {
    & > .status-dot {
      background: var(--td-success-color);
    }
    & > .status-label {
      color: var(--td-success-color);
    }
  }

  &-warning {
    & > .status-dot {
      background: var(--td-warning-color);
    }
    & > .status-label {
      color: var(--td-warning-color);
    }
  }

  &-error {
    & > .status-dot {
      background: var(--td-error-color);
    }
    & > .status-label {
      color: var(--td-error-color);
    }
  }

  &-size {
    &-mini {
      & > .status-dot {
        width: 3px;
        height: 3px;
      }

      & > .status-label {
        font-size: 10px;
      }
    }
    &-small {
      & > .status-dot {
        width: 5px;
        height: 5px;
      }

      & > .status-label {
        font-size: 12px;
      }
    }
    &-medium {
      & > .status-dot {
        width: 7px;
        height: 7px;
      }

      & > .status-label {
        font-size: 14px;
      }
    }

    &-large {
      & > .status-dot {
        width: 9px;
        height: 9px;
      }

      & > .status-label {
        font-size: 16px;
      }
    }
  }
}

@keyframes warn {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  30% {
    opacity: 0.7;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>
