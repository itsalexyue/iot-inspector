import React from 'react';
import { Row, Column, Alignments } from 'react-foundation';

import Sidebar from '../sidebar/Sidebar';
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
      <Row style={{maxWidth: 'none'}}>
        <Column large={2}>
          <Sidebar />
        </Column>
        <Column large={10}>
          { this.props.children }
        </Column>
      </Row>
    );
  }
}
GlobalLayout.childContextTypes = {
  location: React.PropTypes.object,
};
exports.GlobalLayout = GlobalLayout;