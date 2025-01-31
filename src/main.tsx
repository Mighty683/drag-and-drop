// import ReactDom from 'react-dom';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import './index.css';

// ReactDom.render(<App />, document.getElementById('root'));
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
