import { HashRouter as Router } from 'react-router-dom';
import { Calculator } from './components/Calculator';
import backgroundSvg from './background.svg';
import './App.css';

const App = () => {
    return (
        <Router>
            <div className="app-container" style={{ backgroundImage: `url(${backgroundSvg})` }}>
                <div className="background-overlay"></div>
                <main className="app-content">
                    <Calculator />
                </main>
            </div>
        </Router>
    );
};

export default App;