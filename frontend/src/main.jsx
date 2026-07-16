import React from 'react'; // 👈 FALTABA ESTO
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify'; // 👈 FALTABA ESTO
import 'react-toastify/dist/ReactToastify.css'; // 👈 FALTABAN LOS ESTILOS DE LOS TOAST

import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20 }}>
                    <h2>Se produjo un error al renderizar la aplicación</h2>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

// Global error handlers to capture errors that otherwise don't appear in console
window.addEventListener('error', (e) => {
    console.error('Global error event:', e.error || e.message, e);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Debug logs to detect undefined imports/components
console.log('React version:', React.version);
console.log('App component:', App);
console.log('ToastContainer component:', ToastContainer);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
            <ToastContainer />
        </ErrorBoundary>
    </React.StrictMode>
);