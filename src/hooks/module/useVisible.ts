/**
 * hook - 显示
 */
export default function useVisible(initValue = false) {
  // 是否显示
  const visible = ref(initValue);

  // 设置显示状态
  const setVisible = (value: boolean) => {
    visible.value = value;
  };

  // 打开
  const open = () => {
    visible.value = true;
  };

  //关闭
  const close = () => {
    visible.value = false;
  };
  return {
    visible,
    setVisible,
    open,
    close,
  };
}
