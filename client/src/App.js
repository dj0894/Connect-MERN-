import React, { Fragment, fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css';
//Redux
import { Provider } from 'react-redux';// connects react and redux
import store from './store';


const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path='/' component={Landing} />
          <section className="conatiner">
            <switch>
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
            </switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
}

export default App;
