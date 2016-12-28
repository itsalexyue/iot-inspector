import React from 'react';
import { Row, Column, Alignments } from 'react-foundation';
// import Header from './Header.jsx';
// import Footer from './Footer.jsx';

class GlobalLayout extends React.Component {
  getChildContext() {
    return {
      location: this.props.location
    };
  }

  render() {
    return (
      <div>
        {/*<Header />*/}
        { this.props.children }
        {/*<Footer />*/}
      </div>
    );
  }
}
GlobalLayout.childContextTypes = {
  location: React.PropTypes.object,
};
exports.GlobalLayout = GlobalLayout;