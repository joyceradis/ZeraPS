import './ui/app.css';
import { mountApp } from './ui/app';

export const ZERA_PS_V2_RUNTIME = 'clean-room' as const;

const root = document.querySelector<HTMLElement>('#app');
if (root) mountApp(root);
