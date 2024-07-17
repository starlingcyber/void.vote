import { penumbraClientContext } from '../context/penumbraContext';
import { useContext } from 'react';

export const usePenumbra = () => {
  const penumbraClient = useContext(penumbraClientContext);
  return penumbraClient;
};