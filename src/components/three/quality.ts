import {createContext,useContext} from 'react';
import type {GraphicsTier} from './types';
export const DetailTier=createContext<GraphicsTier>('medium');
export const useDetailTier=()=>useContext(DetailTier);
