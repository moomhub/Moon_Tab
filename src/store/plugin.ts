import { PersistenceOptions } from 'pinia-plugin-persistedstate';

//  pinia持久化参数配置
const persist = (name: string) => {
  const persistedState: PersistenceOptions = {
    key: name,
    storage: localStorage,
  };
  return persistedState;
};

export default persist;