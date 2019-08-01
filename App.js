import React from 'react';
import Router from './src/Router';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }
  
  async componentWillMount() {    
    console.disableYellowBox = true
    this.setState({ loading: false });
  }
  
  render() {    
    return (
     <Router/>
    );
  }
}