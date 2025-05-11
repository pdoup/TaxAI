import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import TaxForm from './components/TaxForm';
import Navbar from './components/Navbar';
import NotFoundPage from './components/NotFoundPage';
import './App.css'; // Global styles
import 'animate.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          {' '}
          {/* Added main tag with container class */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tax-form" element={<TaxForm />} />
            <Route path="*" element={<NotFoundPage />} />
            {/* Define more routes? */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
