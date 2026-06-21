import { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useTripStore } from '@/store/useTripStore';
import './app.scss';

function App(props) {
  const initApp = useTripStore((s) => s.initApp);
  const initialized = useTripStore((s) => s.initialized);

  useEffect(() => {
    initApp();
  }, [initApp]);

  useDidShow(() => {
    if (!initialized) {
      initApp();
    }
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
