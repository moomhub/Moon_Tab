/**
 * @description 加载状态
 * @param {number} initValue 初始状态，默认为false
 */
export default function useLoading(initValue = true) {
  // 加载状态
  const loading = ref(initValue);
  // 设置加载状态
  const setLoading = (value: boolean) => {
    loading.value = value;
  };
  // 切换加载状态
  const switchLoading = () => {
    loading.value = !loading.value;
  };
  return {
    loading,
    setLoading,
    switchLoading,
  };
}
